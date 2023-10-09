const DEMORA = 200;

class Tipeo {

  constructor(elemSelectorOrObject) {
    // puede ser un selector css o un objeto con atributo text:
    this.isObject = typeof elemSelectorOrObject === 'object';
    if (this.isObject) {
      this.obj = elemSelectorOrObject;
    } else {
      this.elem = document.querySelector(elemSelectorOrObject);
    }
    this.comando_actual = null;
    this.mensaje_actual = '';
    this.lista_comandos = [];
    this.borrando = false;
    this.timeout = setTimeout(() => this.step(), DEMORA);
  }

  getText() {
    if (this.isObject) {
      return this.obj.text;
    } else {
      return this.elem.innerHTML;
    }
  }

  setText(text) {
    if (this.isObject) {
      this.obj.text = text;
    } else {
      this.elem.innerHTML = text;
    }
  }

  step() {
    let fin_comandos = false;

    if (this.comando_actual === 'tipear') {
      if (this.mensaje_actual.length) {
        const caracter = this.mensaje_actual[0]
        this.mensaje_actual = this.mensaje_actual.substring(1);
        this.setText(this.getText() + caracter);
      } else {
        // done tipear, siguiente comando
        if (this.lista_comandos.length) {
          [this.comando_actual, this.mensaje_actual] = this.lista_comandos.shift();
        } else {
          fin_comandos = true;
        }
      }
    } else if (this.comando_actual === 'borrar') {
      if (this.getText().length) {
        this.setText(this.getText().substring(0, this.getText().length - 1));

      } else {
        // done borrar, siguiente comando
        if (this.lista_comandos.length) {
          [this.comando_actual, this.mensaje_actual] = this.lista_comandos.shift();
        } else {
          fin_comandos = true;
        }
      }
    } else if (this.comando_actual === null) {
      // siguiente comando
      if (this.lista_comandos.length) {
        [this.comando_actual, this.mensaje_actual] = this.lista_comandos.shift();
      } else {
        fin_comandos = true;
      }
    }

    if (!fin_comandos) {
      this.timeout = setTimeout(() => this.step(), DEMORA);
    } else {
      this.timeout = null;
    }
  }

  tipear(mensaje, sinBorrar=false) {
    if (sinBorrar) {
      this.lista_comandos.push(['tipear', mensaje]);
    } else {
      this.lista_comandos.push(['borrar']);
      this.lista_comandos.push(['tipear', mensaje]);
    }
    if (this.timeout === null) {
      this.timeout = setTimeout(() => this.step(), DEMORA);
    }
  }

  borrar() {
    this.lista_comandos.push(['borrar']);
    if (this.timeout === null) {
      this.timeout = setTimeout(() => this.step(), DEMORA);
    }
  }

}

window.Tipeo = Tipeo;