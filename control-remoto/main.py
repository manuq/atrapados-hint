#!/usr/bin/env python3

import cmd
import sys
import asyncio
import websockets
import logging
# logger = logging.getLogger('websockets')
# logger.setLevel(logging.DEBUG)
# logger.addHandler(logging.StreamHandler())


class ControlShell(cmd.Cmd):
    intro = 'Bienvenidx al control remoto de la sala! Tipear ayuda o ? para ver la lista de comandos.\n'
    prompt = '>>> '
    # file = None

    def do_ayuda(self, *args, **kwargs):
        """Lista los comandos y muestra ayuda detallada con "ayuda comando"."""
        return self.do_help(*args, **kwargs)

    def do_salir(self, arg):
        """Termina el programa."""
        print(arg)
        return True

    def default(self, line):
        # FIXME
        print('Enviado!')

    # def parseline(self, line):
    #     if not line:
    #         return None, None, line
    #     elif line[0] == '!':

async def handler(websocket):
    while True:
        try:
            r = input(">>> ")
            await websocket.send(r)
            await asyncio.sleep(0.5)

        except EOFError:
            print("saliendo")
            # FIXME cancelar el asyncio.Future
            break

        except websockets.ConnectionClosed:
            print("conexión cerrada")
            break
    print("done")


async def main():
    # ControlShell().cmdloop()
    async with websockets.serve(handler, "", 8001):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
