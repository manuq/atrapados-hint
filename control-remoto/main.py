#!/usr/bin/env python3

import sys
import asyncio
import readline
import logging
from os import environ

import websockets

## Para debug:
# logger = logging.getLogger('websockets')
# logger.setLevel(logging.DEBUG)
# logger.addHandler(logging.StreamHandler())


future = None

OPCIONES = {
    '/ayuda': {'doc': 'Muestra la lista de comandos'},
    '/glitch': {'doc': 'Pone la pantalla en modo glitch'},
    '/normal': {'doc': 'Pone la pantalla en modo normal'},
    '/salir': {'doc': 'Termina este programa'},
}

intro = '''
¡Bienvenidx al control remoto de la sala! Una vez que se conecte, tipear (casi) cualquier cosa y apretar enter para mandar a la pantalla. Se puede continuar texto empezando con "_". Ejemplo:

>>> hola
>>> _ qué tal?

También hay un par de comandos que empiezan con "/". Tipear /ayuda para ver la lista de comandos. Se pueden completar los comandos apretando TAB.

Esperando conexión… (recargar la página de la pantalla si no se conecta)'''


class MyCompleter():
    def __init__(self, options):
        self.options = sorted(options)

    def complete(self, text, state):
        if state == 0:  # on first trigger, build possible matches
            if not text:
                self.matches = self.options[:]
            else:
                self.matches = [s for s in self.options
                                if s and s.startswith(text)]

        # return match indexed by state
        try:
            return self.matches[state]
        except IndexError:
            return None

    def display_matches(self, substitution, matches, longest_match_length):
        line_buffer = readline.get_line_buffer()
        columns = environ.get("COLUMNS", 80)

        print()

        tpl = "{:<" + str(int(max(map(len, matches)) * 1.2)) + "}"

        buffer = ""
        for match in matches:
            match = tpl.format(match[len(substitution):])
            if len(buffer + match) > columns:
                print(buffer)
                buffer = ""
            buffer += match

        if buffer:
            print(buffer)

        print("> ", end="")
        print(line_buffer, end="")
        sys.stdout.flush()

async def handler(websocket):
    global future

    parar = False
    prompt = ">>> "
    print('¡Conectado!')
    while not parar:
        try:
            linea = input(prompt)
            linea = linea.strip()
            if linea in OPCIONES:
                if linea == '/ayuda':
                    for opcion, data in OPCIONES.items():
                        print(f'{opcion} - {data["doc"]}')
                elif linea == '/salir':
                    print()
                    parar = True
                elif linea == '/glitch':
                    # FIXME no implementado
                    print('poniendo la pantalla en modo glitch…')
                elif linea == '/normal':
                    # FIXME no implementado
                    print('poniendo la pantalla en modo normal…')
            else:
                await websocket.send(linea)
                await asyncio.sleep(0.5)

        except (KeyboardInterrupt, EOFError):
            print()
            parar = True

        except websockets.ConnectionClosed:
            print("conexión cerrada")
            parar = True

    future.set_result("FIN")


def iniciar_autocompletado():
    completer = MyCompleter(list(set(OPCIONES.keys())))
    readline.set_completer_delims(' \t\n;')
    readline.set_completer(completer.complete)
    readline.parse_and_bind('tab: complete')
    readline.set_completion_display_matches_hook(completer.display_matches)


async def main():
    global future
    iniciar_autocompletado()
    print(intro)
    loop = asyncio.get_event_loop()
    future = loop.create_future()
    async with websockets.serve(handler, "", 8001):
        await future


if __name__ == "__main__":
    asyncio.run(main())
