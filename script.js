/* =========================================
   FACU-APUNTES v0.1
   ========================================= */


/* =========================================
   CONFIGURACIÓN
   ========================================= */

const MATERIAS_POR_DEFECTO = [
    "COMERCIAL",
    "CONTRATOS",
    "PROCESAL"
];

const STORAGE_MATERIAS = "derecho_uba_materias";


/* =========================================
   ELEMENTOS HTML
   ========================================= */

const btnMateria =
    document.getElementById("btnMateria");

const menuMateria =
    document.getElementById("menuMateria");

const fecha =
    document.getElementById("fecha");

const materiaSeleccionada =
    document.getElementById("materiaSeleccionada");

const nota =
    document.getElementById("nota");

const contador =
    document.getElementById("contador");

const estado =
    document.getElementById("estado");

const mensaje =
    document.getElementById("mensaje");

const btnNuevo =
    document.getElementById("btnNuevo");

const btnGuardar =
    document.getElementById("btnGuardar");

const modalConfiguracion =
    document.getElementById("modalConfiguracion");

const btnCerrarConfiguracion =
    document.getElementById("btnCerrarConfiguracion");

const btnCerrarModal =
    document.getElementById("btnCerrarModal");

const listaMaterias =
    document.getElementById("listaMaterias");

const nuevaMateria =
    document.getElementById("nuevaMateria");

const btnAgregarMateria =
    document.getElementById("btnAgregarMateria");


/* =========================================
   ESTADO ACTUAL
   ========================================= */

let materiaActual = "";

let apunteActualId = null;

let fechaCreacionActual = null;

let guardadoAutomatico = null;


/* =========================================
   INICIO
   ========================================= */

iniciar();


async function iniciar() {

    cargarMaterias();

    actualizarFecha();

    actualizarContador();

    iniciarGuardadoAutomatico();

    console.log("Facu Apuntes iniciado.");

}


/* =========================================
   FECHA DE LA PANTALLA
   ========================================= */

function actualizarFecha() {

    const ahora = new Date();

    const opciones = {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    };

    fecha.textContent =
        ahora.toLocaleDateString(
            "es-AR",
            opciones
        );
}


/* =========================================
   MATERIAS
   ========================================= */

function cargarMaterias() {

    let materias =
        JSON.parse(
            localStorage.getItem(
                STORAGE_MATERIAS
            )
        );


    if (
        !materias ||
        materias.length === 0
    ) {

        materias = [
            ...MATERIAS_POR_DEFECTO
        ];

        guardarMaterias(materias);

    }


    mostrarMateriasMenu(materias);

    mostrarMateriasConfiguracion(materias);

}


function guardarMaterias(materias) {

    localStorage.setItem(
        STORAGE_MATERIAS,
        JSON.stringify(materias)
    );

}


function obtenerMaterias() {

    return JSON.parse(
        localStorage.getItem(
            STORAGE_MATERIAS
        )
    ) || [];

}


/* =========================================
   MENÚ DE MATERIAS
   ========================================= */

function mostrarMateriasMenu(materias) {

    menuMateria.innerHTML = "";


    materias.forEach(function(materia) {

        const boton =
            document.createElement("button");

        boton.textContent =
            materia;


        boton.addEventListener(
            "click",
            function() {

                seleccionarMateria(materia);

            }
        );


        menuMateria.appendChild(boton);

    });


    const separador =
        document.createElement("div");

    separador.className =
        "separador";

    menuMateria.appendChild(separador);


    const configuracion =
        document.createElement("button");

    configuracion.className =
        "btn-configuracion";

    configuracion.textContent =
        "⚙ CONFIGURACIÓN";


    configuracion.addEventListener(
        "click",
        abrirConfiguracion
    );


    menuMateria.appendChild(
        configuracion
    );

}


/* =========================================
   SELECCIONAR MATERIA
   ========================================= */

function seleccionarMateria(materia) {

    /*
       Si no hay materia seleccionada,
       simplemente comenzamos un apunte nuevo.
    */

    if (materiaActual === "") {

        materiaActual = materia;

        iniciarNuevoApunte();

        return;
    }


    /*
       Si es la misma materia,
       seguimos trabajando en el mismo apunte.
    */

    if (materiaActual === materia) {

        menuMateria.classList.add(
            "oculto"
        );

        return;
    }


    /*
       Si cambia la materia:
       guardamos el apunte actual
       y comenzamos uno nuevo.
    */

    if (nota.value.trim() !== "") {

        guardarNota(true);

    }


    materiaActual = materia;

    iniciarNuevoApunte();

}


/* =========================================
   NUEVO APUNTE
   ========================================= */

function iniciarNuevoApunte() {

    apunteActualId = null;

    fechaCreacionActual =
        new Date();


    nota.value = "";

    actualizarContador();


    materiaSeleccionada.textContent =
        materiaActual;


    materiaSeleccionada.style.color =
        "#e5e7eb";


    estado.textContent =
        "Nuevo apunte · " +
        materiaActual;


    menuMateria.classList.add(
        "oculto"
    );


    nota.focus();

}


/* =========================================
   MENÚ
   ========================================= */

btnMateria.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        menuMateria.classList.toggle(
            "oculto"
        );

    }
);


document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(
                ".header"
            )
        ) {

            menuMateria.classList.add(
                "oculto"
            );

        }

    }
);


/* =========================================
   CONTADOR
   ========================================= */

nota.addEventListener(
    "input",
    actualizarContador
);


function actualizarContador() {

    contador.textContent =
        nota.value.length +
        " caracteres";

}


/* =========================================
   GUARDAR APUNTE
   ========================================= */

btnGuardar.addEventListener(
    "click",
    function() {

        guardarNota(false);

    }
);


async function guardarNota(esAutomatico) {

    const texto =
        nota.value.trim();


    if (texto === "") {

        if (!esAutomatico) {

            mostrarMensaje(
                "No hay nada para guardar."
            );

        }

        return;

    }


    if (materiaActual === "") {

        if (!esAutomatico) {

            mostrarMensaje(
                "Primero elegí una materia."
            );

        }

        return;

    }


    /*
       Si todavía no existe un ID,
       estamos creando un apunte nuevo.
    */

    if (!apunteActualId) {

        const fechaCreacion =
            fechaCreacionActual ||
            new Date();


        const { data, error } =
            await supabaseClient
                .from("apuntes")
                .insert({

                    materia:
                        materiaActual,

                    fecha_creacion:
                        fechaCreacion
                            .toISOString(),

                    fecha_modificacion:
                        new Date()
                            .toISOString(),

                    titulo:
                        obtenerTitulo(),

                    contenido:
                        texto

                })
                .select()
                .single();


        if (error) {

            console.error(
                "Error al crear apunte:",
                error
            );


            if (!esAutomatico) {

                mostrarMensaje(
                    "Error al guardar."
                );

            }

            return;

        }


        apunteActualId =
            data.id;


        fechaCreacionActual =
            new Date(
                data.fecha_creacion
            );


        estado.textContent =
            "Guardada · " +
            materiaActual;


        if (!esAutomatico) {

            mostrarMensaje(
                "✓ Apunte guardado"
            );

        }


        return;

    }


    /*
       Si ya existe ID,
       actualizamos el apunte.
    */

    const ahora =
        new Date();


    const { error } =
        await supabaseClient
            .from("apuntes")
            .update({

                materia:
                    materiaActual,

                fecha_modificacion:
                    ahora.toISOString(),

                titulo:
                    obtenerTitulo(),

                contenido:
                    texto

            })
            .eq(
                "id",
                apunteActualId
            );


    if (error) {

        console.error(
            "Error al actualizar:",
            error
        );


        if (!esAutomatico) {

            mostrarMensaje(
                "Error al actualizar."
            );

        }

        return;

    }


    estado.textContent =
        "Actualizada · " +
        materiaActual;


    if (!esAutomatico) {

        mostrarMensaje(
            "✓ Cambios guardados"
        );

    }

}


/* =========================================
   TÍTULO AUTOMÁTICO
   ========================================= */

function obtenerTitulo() {

    const texto =
        nota.value.trim();


    if (texto === "") {

        return "Apunte";

    }


    /*
       Por ahora utilizamos la primera línea
       como título.
    */

    const primeraLinea =
        texto.split("\n")[0]
            .trim();


    if (
        primeraLinea.length > 80
    ) {

        return primeraLinea.substring(
            0,
            80
        );

    }


    return primeraLinea || "Apunte";

}


/* =========================================
   GUARDADO AUTOMÁTICO
   ========================================= */

function iniciarGuardadoAutomatico() {

    /*
       Cada 5 minutos.
    */

    guardadoAutomatico =
        setInterval(
            function() {

                if (
                    nota.value.trim() !== "" &&
                    materiaActual !== ""
                ) {

                    guardarNota(true);

                }

            },
            5 * 60 * 1000
        );

}


/* =========================================
   NUEVO
   ========================================= */

btnNuevo.addEventListener(
    "click",
    function() {

        if (
            nota.value.trim() !== ""
        ) {

            const confirmar =
                confirm(
                    "¿Querés comenzar un nuevo apunte?"
                );


            if (!confirmar) {

                return;

            }

        }


        if (materiaActual === "") {

            mostrarMensaje(
                "Primero elegí una materia."
            );

            return;

        }


        iniciarNuevoApunte();

    }
);


/* =========================================
   MENSAJES
   ========================================= */

function mostrarMensaje(texto) {

    mensaje.textContent =
        texto;


    setTimeout(
        function() {

            mensaje.textContent =
                "";

        },
        2000
    );

}


/* =========================================
   CONFIGURACIÓN
   ========================================= */

function abrirConfiguracion() {

    menuMateria.classList.add(
        "oculto"
    );


    mostrarMateriasConfiguracion(
        obtenerMaterias()
    );


    modalConfiguracion.classList.remove(
        "oculto"
    );

}


function cerrarConfiguracion() {

    modalConfiguracion.classList.add(
        "oculto"
    );


    nota.focus();

}


btnCerrarConfiguracion.addEventListener(
    "click",
    cerrarConfiguracion
);


btnCerrarModal.addEventListener(
    "click",
    cerrarConfiguracion
);


/* =========================================
   MOSTRAR CONFIGURACIÓN
   ========================================= */

function mostrarMateriasConfiguracion(
    materias
) {

    listaMaterias.innerHTML = "";


    materias.forEach(
        function(materia, indice) {

            const fila =
                document.createElement(
                    "div"
                );


            fila.className =
                "materia-item";


            const nombre =
                document.createElement(
                    "span"
                );


            nombre.className =
                "materia-nombre";


            nombre.textContent =
                materia;


            const acciones =
                document.createElement(
                    "div"
                );


            acciones.className =
                "materia-acciones";


            const editar =
                document.createElement(
                    "button"
                );


            editar.textContent =
                "✏";


            editar.title =
                "Editar materia";


            editar.addEventListener(
                "click",
                function() {

                    editarMateria(
                        indice
                    );

                }
            );


            const eliminar =
                document.createElement(
                    "button"
                );


            eliminar.textContent =
                "×";


            eliminar.title =
                "Eliminar materia";


            eliminar.addEventListener(
                "click",
                function() {

                    eliminarMateria(
                        indice
                    );

                }
            );


            acciones.appendChild(
                editar
            );


            acciones.appendChild(
                eliminar
            );


            fila.appendChild(
                nombre
            );


            fila.appendChild(
                acciones
            );


            listaMaterias.appendChild(
                fila
            );

        }
    );

}


/* =========================================
   AGREGAR MATERIA
   ========================================= */

btnAgregarMateria.addEventListener(
    "click",
    agregarMateria
);


nuevaMateria.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            agregarMateria();

        }

    }
);


function agregarMateria() {

    const nombre =
        nuevaMateria.value
            .trim()
            .toUpperCase();


    if (nombre === "") {

        return;

    }


    let materias =
        obtenerMaterias();


    const existe =
        materias.some(
            function(materia) {

                return materia === nombre;

            }
        );


    if (existe) {

        alert(
            "Esa materia ya existe."
        );

        return;

    }


    materias.push(
        nombre
    );


    guardarMaterias(
        materias
    );


    nuevaMateria.value =
        "";


    cargarMaterias();


    mostrarMateriasConfiguracion(
        materias
    );

}


/* =========================================
   EDITAR MATERIA
   ========================================= */

function editarMateria(indice) {

    let materias =
        obtenerMaterias();


    const actual =
        materias[indice];


    const nuevoNombre =
        prompt(
            "Nuevo nombre de la materia:",
            actual
        );


    if (
        nuevoNombre === null
    ) {

        return;

    }


    const nombre =
        nuevoNombre
            .trim()
            .toUpperCase();


    if (nombre === "") {

        return;

    }


    materias[indice] =
        nombre;


    guardarMaterias(
        materias
    );


    if (
        materiaActual === actual
    ) {

        materiaActual =
            nombre;


        materiaSeleccionada.textContent =
            nombre;


        estado.textContent =
            "Nuevo apunte · " +
            nombre;

    }


    cargarMaterias();


    mostrarMateriasConfiguracion(
        materias
    );

}


/* =========================================
   ELIMINAR MATERIA
   ========================================= */

function eliminarMateria(indice) {

    let materias =
        obtenerMaterias();


    if (
        materias.length <= 1
    ) {

        alert(
            "Debe quedar al menos una materia."
        );

        return;

    }


    const materia =
        materias[indice];


    const confirmar =
        confirm(
            "¿Querés eliminar " +
            materia +
            "?"
        );


    if (!confirmar) {

        return;

    }


    materias.splice(
        indice,
        1
    );


    guardarMaterias(
        materias
    );


    if (
        materiaActual === materia
    ) {

        materiaActual =
            "";


        materiaSeleccionada.textContent =
            "Seleccionar";


        materiaSeleccionada.style.color =
            "#9ca3af";


        estado.textContent =
            "Nueva captura";

    }


    cargarMaterias();


    mostrarMateriasConfiguracion(
        materias
    );

}


/* =========================================
   PROTECCIÓN AL SALIR
   ========================================= */

window.addEventListener(
    "beforeunload",
    function() {

        /*
           No podemos esperar una consulta
           asíncrona a Supabase aquí.
           El guardado automático periódico
           es la protección principal.
        */

        if (
            nota.value.trim() !== "" &&
            materiaActual !== ""
        ) {

            console.log(
                "Hay cambios en el apunte."
            );

        }

    }
);