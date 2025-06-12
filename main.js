class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.personaje = null;
        this.monedas = [];
        this.puntuacion = 0;
        this.crearEscenario();
        this.agregarEventos();
        this.puntosElement = document.getElementById("puntos");
        this.tiempoRestante = 60; // 60 segundos
        this.tiempoElement = document.getElementById("tiempo");
        this.temporizador = null;
        this.iniciarTemporizador();
        this.malos = [];
        this.buenos = [];
        this.crearMalos();
        this.fin = false;
        this.crearBuenos();
    }
    iniciarTemporizador() {
        this.temporizador = setInterval(() => {
            this.tiempoRestante--;
            const minutos = Math.floor(this.tiempoRestante / 60);
            const segundos = this.tiempoRestante % 60;
            this.tiempoElement.textContent = `Tiempo ${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
            if (this.tiempoRestante <= 0) {
                clearInterval(this.temporizador);
                this.finDelJuego();
            }
        }, 1000);
    }

    crearEscenario() {
        this.personaje = new Personaje();
        this.container.appendChild(this.personaje.element);
        for (let i = 0; i < 8; i++) {
            const moneda = new Moneda();
            this.monedas.push(moneda);
            this.container.appendChild(moneda.element);
        }

    }

    agregarEventos() {
        window.addEventListener("keydown", (e) => this.personaje.mover(e));
        this.checkColisiones();
    }

    checkColisiones() {
        const textM = "texto-colision";
        const textB = "texto-colisionB";
        setInterval(() => {
            this.monedas.forEach((moneda, index) => {
                if (this.personaje.colisionaCon(moneda)) {
                    this.container.removeChild(moneda.element);
                    this.monedas.splice(index, 1);
                    this.actualizarPuntuacion(10);
                    const sonidoBien = document.getElementById('sonido-moneda');
                    sonidoBien.currentTime = 0;
                    sonidoBien.play();
                    this.verificarVictoria();

                }
            });
            this.malos.forEach((malo) => {
                if (this.personaje.colisionaCon(malo) && !malo.colisionado) {
                    malo.colisionado = true;
                    this.mostrarTexto("-20", this.personaje.x, this.personaje.y, textM);
                    this.restarTiempo(-20);
                    setTimeout(() => {
                        malo.eliminar();
                    }, 200);
                    const sonidoMal = document.getElementById('sonido-medusa');
                    sonidoMal.currentTime = 0;
                    sonidoMal.play();
                }
            });

            this.buenos.forEach((bueno) => {
                if (this.personaje.colisionaCon(bueno) && !bueno.colisionado) {
                    bueno.colisionado = true;
                    this.mostrarTexto("+10s", this.personaje.x, this.personaje.y, textB);
                    this.restarTiempo(10);
                    setTimeout(() => {
                        bueno.eliminar();
                    }, 200);
                    const sonidoAir = document.getElementById('sonido-air');
                    sonidoAir.currentTime = 0;
                    sonidoAir.play();
                }
            });


        }, 50)
    }
    actualizarPuntuacion(puntos) {
        this.puntuacion += puntos;
        this.puntosElement.textContent = `Puntos: ${this.puntuacion}`;

    }
    mostrarTexto(texto, x, y, t) {
        const textoDiv = document.createElement("div");
        textoDiv.className = t;
        textoDiv.style.left = `${x}px`;
        textoDiv.style.top = `${y}px`;
        textoDiv.textContent = texto;
        this.container.appendChild(textoDiv);
        setTimeout(() => {
            if (textoDiv.parentNode) {
                textoDiv.parentNode.removeChild(textoDiv);
            }
        }, 1000);
    }

    crearMalos() {
        setInterval(() => {
            if (this.malos.length < 6 && this.fin === false) {
                const malo = new PersonajeMalo();
                this.malos.push(malo);
                this.container.appendChild(malo.element);
            }
        }, 4000);
    }

    crearBuenos() {
        setInterval(() => {
            if (this.buenos.length < 2 && this.fin === false) {
                const bueno = new PersonajeBueno();
                this.buenos.push(bueno);
                this.container.appendChild(bueno.element);
            }
        }, 7000);
    }


    restarTiempo(segundos) {
        this.tiempoRestante += segundos;
        if (this.tiempoRestante < 0) this.tiempoRestante = 0;
        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundosRest = this.tiempoRestante % 60;
        this.tiempoElement.textContent = `Tiempo: ${minutos.toString().padStart(2, '0')}:${segundosRest.toString().padStart(2, '0')}`;
    }

    limpiarPantalla() {
        clearInterval(this.temporizador); // para el tiempo
        this.fin = true;
        this.monedas.forEach(moneda => {
            if (moneda.element.parentNode) {
                moneda.element.parentNode.removeChild(moneda.element);
            }
        });
        this.monedas = [];
        if (this.personaje && this.personaje.element.parentNode) {
            this.personaje.element.parentNode.removeChild(this.personaje.element);
        }
        this.malos.forEach(malo => {
            clearInterval(malo.intervaloMovimiento);
            if (malo.element.parentNode) {
                malo.element.parentNode.removeChild(malo.element);
            }
        });
        this.malos = [];
        this.buenos.forEach(bueno => {
            clearInterval(bueno.intervaloMovimiento);
            if (bueno.element.parentNode) {
                bueno.element.parentNode.removeChild(bueno.element);
            }
        });
        this.buenos = [];


    }
    verificarVictoria() {
        setTimeout(() => {
            if (this.monedas.length === 0) {
                this.limpiarPantalla();
                document.getElementById('modalWin').style.display = 'flex';
                const musicaFondo = document.getElementById('musica-fondo');
                const musicaWin = document.getElementById('sonido-ganar');
                musicaFondo.pause();
                musicaFondo.currentTime = 0;
                musicaWin.play();
            }
        }, 500);
    }


    finDelJuego() {
        setTimeout(() => {
            this.limpiarPantalla();
            document.getElementById('modalTiempo').style.display = 'flex';
        }, 500);

        const perder = document.getElementById('sonido-perder');
        perder.play();
        const musica = document.getElementById('musica-fondo');
        musica.pause();
        musica.currentTime = 0;
    }
}


class Personaje {
    constructor() {
        this.x = 0;   // a la izquierda
        this.y = 280;
        this.width = 50;
        this.height = 50;
        this.velocidad = 10;
        this.saltando = false;
        this.element = document.createElement("div");
        this.element.classList.add("personaje");
        this.actualizarPosicion();

    }
    mover(evento) {
        if (evento.key === "ArrowRight" && this.x + this.width + this.velocidad <= 750) {
            this.element.style.backgroundImage = 'url(./img/lina.png)';

            this.x += this.velocidad;
        } else if (evento.key === "ArrowLeft" && this.x - this.velocidad >= 0) {
            this.element.style.backgroundImage = 'url(./img/lina_left.png)';

            this.x -= this.velocidad;
        } else if (evento.key === "ArrowUp" && !this.saltando) {
            this.saltar();
        }

        this.actualizarPosicion();
    }
    saltar() {
        this.saltando = true;
        this.element.style.backgroundImage = 'url(./img/lina_salta.png)';
        let alturaMaxima = Math.max(0, this.y - 300);

        const salto = setInterval(() => {
            if (this.y > alturaMaxima) {
                this.y -= 20;
            } else {
                clearInterval(salto);
                this.caer();
            }
            this.actualizarPosicion();
        }, 20);
    }

    caer() {
        const gravedad = setInterval(() => {
            //if (this.y + this.height + 10 <= 600) {
            if (this.y < 280) {
                this.y += 10;
            } else {
                // this.y = 600 - this.height;
                clearInterval(gravedad);
                this.saltando = false;
                this.element.style.backgroundImage = 'url(./img/lina.png)';
            } this.actualizarPosicion();
        }
            , 20);
    }


    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    colisionaCon(objeto) {
        return (
            this.x < objeto.x + objeto.width &&
            this.x + this.width > objeto.x &&
            this.y < objeto.y + objeto.height &&
            this.y + this.height > objeto.y
        );
    }

}

class Moneda {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * 700;
        this.y = Math.random() * 320;



        this.element = document.createElement("div");
        this.element.classList.add("moneda");

        this.actualizarPosicion();
    }
    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
}




class PersonajeMalo extends Personaje {
    constructor() {
        super();
        this.velocidad = 2 + Math.random() * 2;
        this.x = -80; // comienza fuera de la pantalla izquierda
        this.y = Math.random() * 350;
        this.colisionado = false;
        this.element.classList.remove("personaje");
        this.element.classList.add("personaje-malo");
        this.actualizarPosicion();
        this.mover();
    }

    mover() {
        this.intervaloMovimiento = setInterval(() => {
            this.x += this.velocidad;
            if (this.x > 1000) {
                this.eliminar();
                return;
            }
            this.actualizarPosicion();
        }, 30);
    }

    eliminar() {
        clearInterval(this.intervaloMovimiento);
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        if (window.juego && window.juego.malos) {
            const idx = window.juego.malos.indexOf(this);
            if (idx !== -1) window.juego.malos.splice(idx, 1);
        }
    }
}

class PersonajeBueno extends PersonajeMalo {
    constructor() {
        super();
        this.element.classList.remove("personaje-malo");
        this.element.classList.add("personaje-bueno");
    }
    eliminar() {
        clearInterval(this.intervaloMovimiento);
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        if (window.juego && window.juego.buenos) {
            const idx = window.juego.buenos.indexOf(this);
            if (idx !== -1) window.juego.buenos.splice(idx, 1);
        }
    }
}

// Mostrar el modal nada más cargar la página
window.onload = function () {
    document.getElementById('modalP').style.display = 'flex';

    document.getElementById('start-btn').addEventListener('click', function () {
        document.getElementById('modalP').style.display = 'none';
        const musica = document.getElementById('musica-fondo');
        musica.play();
        const btnMusica = document.getElementById('toggle-music');
        let musicaActiva = true;
        musica.volume = 0.4; // volumen suave
        btnMusica.addEventListener('click', function () {
            if (musicaActiva) {
                musica.pause();
                btnMusica.textContent = "🔇 Música";
            } else {
                musica.play();
                btnMusica.textContent = "🔊 Música";
            }
            musicaActiva = !musicaActiva;
        });
        new Game();
    });
}
document.getElementById('reiniciar-btn').addEventListener('click', function () {
    location.reload();
});

document.getElementById('win-restart-btn').addEventListener('click', () => {
    const musicaWin = document.getElementById('sonido-ganar');
    musicaWin.pause();
    musicaWin.currentTime = 0;
    location.reload();
});


function empezarJuego() {

    const juego = new Game();


}

