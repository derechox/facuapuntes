/* =========================================
   FACU-APUNTES v0.5
   SUPABASE + APUNTES ANTERIORES
   + APUNTE DEL DÍA POR MATERIA
   + VOLVER AL APUNTE ACTUAL
   + AUTOGUARDADO
   + EXPANSIÓN DEL ÁREA DE ESCRITURA
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


/*
   Guarda el apunte que estaba abierto
   antes de entrar a "Apuntes anteriores".
*/

let contextoApunteActual = null;


/* =========================================
   INICIO
   ========================================= */

iniciar();


async function iniciar() {

    cargarMaterias();

    actualizarFecha();

    actualizarContador();

    iniciarGuardadoAutomatico();

    iniciarExpansionEscritura();

    console.log("Facu Apuntes iniciado.");
}


/* =========================================
   FECHA
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
   CLAVE DEL APUNTE DE HOY
   ========================================= */

function obtenerInicioDelDia() {

    const ahora = new Date();

    return new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        0,
        0,
        0,
        0
    );
}


function obtenerFinDelDia() {

    const ahora = new Date();

    return new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        23,
        59,
        59,
        999
    );
}


/* =========================================
   MATERIAS
   ========================================= */

function cargarMaterias() {

    let materias;

    try {

        materias =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_MATERIAS
                )
            );

    } catch (error) {

        materias = null;
    }


    if (
        !Array.isArray(materias) ||
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

    try {

        return JSON.parse(
            localStorage.getItem(
                STORAGE_MATERIAS
            )
        ) || [];

    } catch (error) {

        return [];
    }
}


/* =========================================
   MENÚ DE MATERIAS
   ========================================= */

function mostrarMateriasMenu(materias) {

    menuMateria.innerHTML = "";


    materias.forEach(
        function(materia) {

            const boton =
                document.createElement("button");

            boton.type = "button";

            boton.textContent =
                materia;

            boton.addEventListener(
                "click",
                function() {

                    seleccionarMateria(
                        materia
                    );

                }
            );

            menuMateria.appendChild(
                boton
            );
        }
    );


    /* -----------------------------------------
       APUNTES ANTERIORES
       ----------------------------------------- */

    const separadorApuntes =
        document.createElement("div");

    separadorApuntes.className =
        "separador";

    menuMateria.appendChild(
        separadorApuntes
    );


    const apuntesAnteriores =
        document.createElement("button");

    apuntesAnteriores.type = "button";

    apuntesAnteriores.textContent =
        "📚 APUNTES ANTERIORES";

    apuntesAnteriores.addEventListener(
        "click",
        function() {

            guardarContextoActual();

            menuMateria.classList.add(
                "oculto"
            );

            abrirApuntesAnteriores();

        }
    );

    menuMateria.appendChild(
        apuntesAnteriores
    );


    /* -----------------------------------------
       CONFIGURACIÓN
       ----------------------------------------- */

    const separadorConfiguracion =
        document.createElement("div");

    separadorConfiguracion.className =
        "separador";

    menuMateria.appendChild(
        separadorConfiguracion
    );


    const configuracion =
        document.createElement("button");

    configuracion.type = "button";

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
   CONTEXTO DEL APUNTE ACTUAL
   ========================================= */

function guardarContextoActual() {

    if (
        materiaActual === "" &&
        nota.value.trim() === ""
    ) {

        contextoApunteActual = null;

        return;
    }


    contextoApunteActual = {

        id:
            apunteActualId,

        materia:
            materiaActual,

        contenido:
            nota.value,

        fechaCreacion:
            fechaCreacionActual
                ? fechaCreacionActual.toISOString()
                : null
    };


    console.log(
        "Contexto guardado:",
        contextoApunteActual
    );
}


/* =========================================
   SELECCIONAR MATERIA
   ========================================= */

async function seleccionarMateria(materia) {

    menuMateria.classList.add(
        "oculto"
    );


    if (
        materiaActual === materia
    ) {

        nota.focus();

        return;
    }


    if (
        materiaActual !== "" &&
        nota.value.trim() !== ""
    ) {

        await guardarNota(true);
    }


    materiaActual = materia;


    await cargarApunteDeHoy(materia);
}


/* =========================================
   CARGAR APUNTE DE HOY
   ========================================= */

async function cargarApunteDeHoy(materia) {

    estado.textContent =
        "Buscando apunte de hoy · " +
        materia;


    const inicio =
        obtenerInicioDelDia();

    const fin =
        obtenerFinDelDia();


    const { data, error } =
        await supabaseClient
            .from("apuntes")
            .select(
                "id, materia, fecha_creacion, fecha_modificacion, titulo, contenido"
            )
            .eq(
                "materia",
                materia
            )
            .gte(
                "fecha_creacion",
                inicio.toISOString()
            )
            .lte(
                "fecha_creacion",
                fin.toISOString()
            )
            .order(
                "fecha_creacion",
                {
                    ascending: false
                }
            )
            .limit(1);


    if (error) {

        console.error(
            "Error buscando apunte de hoy:",
            error
        );


        iniciarNuevoApunteSinGuardar();

        mostrarMensaje(
            "No se pudo consultar el apunte de hoy."
        );

        return;
    }


    if (
        data &&
        data.length > 0
    ) {

        cargarApunteEnPantalla(
            data[0],
            "Apunte de hoy · "
        );

        return;
    }


    iniciarNuevoApunteSinGuardar();
}


/* =========================================
   NUEVO APUNTE SIN GUARDAR
   ========================================= */

function iniciarNuevoApunteSinGuardar() {

    apunteActualId = null;

    fechaCreacionActual =
        new Date();

    nota.value = "";

    actualizarContador();

    materiaSeleccionada.textContent =
        materiaActual || "Seleccionar";

    if (materiaActual !== "") {

        materiaSeleccionada.style.color =
            "#e5e7eb";

    } else {

        materiaSeleccionada.style.color =
            "#9ca3af";
    }


    estado.textContent =
        materiaActual
            ? "Nuevo apunte · " +
              materiaActual
            : "Nueva captura";


    eliminarBotonVolverActual();

    nota.focus();
}


/* =========================================
   CARGAR APUNTE EN PANTALLA
   ========================================= */

function cargarApunteEnPantalla(
    apunte,
    textoEstado
) {

    apunteActualId =
        apunte.id;

    materiaActual =
        apunte.materia;

    fechaCreacionActual =
        apunte.fecha_creacion
            ? new Date(
                apunte.fecha_creacion
            )
            : new Date();


    nota.value =
        apunte.contenido || "";

    actualizarContador();


    materiaSeleccionada.textContent =
        materiaActual;

    materiaSeleccionada.style.color =
        "#e5e7eb";


    estado.textContent =
        textoEstado +
        materiaActual;


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


    /*
       Si no hay texto,
       NO SE GUARDA NADA.
    */

    if (texto === "") {

        if (!esAutomatico) {

            mostrarMensaje(
                "No hay nada para guardar."
            );
        }

        return false;
    }


    /*
       Si no hay materia,
       tampoco guardamos.
    */

    if (materiaActual === "") {

        if (!esAutomatico) {

            mostrarMensaje(
                "Primero elegí una materia."
            );
        }

        return false;
    }


    /* =====================================
       CREAR NUEVO APUNTE
       ===================================== */

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
                        fechaCreacion.toISOString(),

                    fecha_modificacion:
                        new Date().toISOString(),

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

            return false;
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


        return true;
    }


    /* =====================================
       ACTUALIZAR APUNTE EXISTENTE
       ===================================== */

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

        return false;
    }


    estado.textContent =
        "Actualizada · " +
        materiaActual;


    if (!esAutomatico) {

        mostrarMensaje(
            "✓ Cambios guardados"
        );
    }


    return true;
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


    const primeraLinea =
        texto
            .split("\n")[0]
            .trim();


    if (
        primeraLinea.length > 80
    ) {

        return primeraLinea.substring(
            0,
            80
        );
    }


    return primeraLinea ||
        "Apunte";
}


/* =========================================
   AUTOGUARDADO
   ========================================= */

function iniciarGuardadoAutomatico() {

    if (guardadoAutomatico) {

        clearInterval(
            guardadoAutomatico
        );
    }


    /*
       Autoguardado cada 5 minutos.
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
   NUEVO APUNTE
   ========================================= */

btnNuevo.addEventListener(
    "click",
    async function() {

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


            await guardarNota(true);
        }


        if (
            materiaActual === ""
        ) {

            mostrarMensaje(
                "Primero elegí una materia."
            );

            return;
        }


        iniciarNuevoApunteSinGuardar();
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
   APUNTES ANTERIORES
   ========================================= */

async function abrirApuntesAnteriores() {

    mostrarMensaje(
        "Buscando apuntes..."
    );


    const { data, error } =
        await supabaseClient
            .from("apuntes")
            .select(
                "id, materia, fecha_creacion, fecha_modificacion, titulo, contenido"
            )
            .order(
                "fecha_creacion",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Error al buscar apuntes:",
            error
        );


        mostrarMensaje(
            "Error al buscar apuntes."
        );

        return;
    }


    mostrarListaApuntes(
        data || []
    );
}


/* =========================================
   MODAL DE APUNTES ANTERIORES
   ========================================= */

function mostrarListaApuntes(apuntes) {

    const modalExistente =
        document.getElementById(
            "modalApuntes"
        );


    if (modalExistente) {

        modalExistente.remove();
    }


    const modal =
        document.createElement("div");

    modal.id =
        "modalApuntes";

    modal.className =
        "modal";


    const contenido =
        document.createElement("div");

    contenido.className =
        "modal-contenido";


    const encabezado =
        document.createElement("div");

    encabezado.className =
        "modal-header";


    const titulo =
        document.createElement("h2");

    titulo.textContent =
        "MIS APUNTES";


    const cerrar =
        document.createElement("button");

    cerrar.className =
        "btn-cerrar";

    cerrar.textContent =
        "×";

    cerrar.title =
        "Cerrar";


    cerrar.addEventListener(
        "click",
        function() {

            volverAlContexto();

            modal.remove();

        }
    );


    encabezado.appendChild(
        titulo
    );

    encabezado.appendChild(
        cerrar
    );

    contenido.appendChild(
        encabezado
    );


    if (
        apuntes.length === 0
    ) {

        const vacio =
            document.createElement("p");

        vacio.textContent =
            "Todavía no hay apuntes guardados.";

        vacio.style.color =
            "#9ca3af";

        vacio.style.textAlign =
            "center";

        vacio.style.padding =
            "30px 10px";


        contenido.appendChild(
            vacio
        );
    }


    apuntes.forEach(
        function(apunte) {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.style.width =
                "100%";

            item.style.textAlign =
                "left";

            item.style.padding =
                "13px";

            item.style.marginBottom =
                "8px";

            item.style.border =
                "1px solid #1f2937";

            item.style.borderRadius =
                "10px";

            item.style.background =
                "#030712";

            item.style.color =
                "#e5e7eb";

            item.style.cursor =
                "pointer";


            const materia =
                document.createElement(
                    "div"
                );


            materia.textContent =
                apunte.materia;

            materia.style.fontWeight =
                "700";

            materia.style.fontSize =
                "14px";


            const fechaApunte =
                document.createElement(
                    "div"
                );


            fechaApunte.textContent =
                formatearFechaApunte(
                    apunte.fecha_creacion
                );

            fechaApunte.style.color =
                "#9ca3af";

            fechaApunte.style.fontSize =
                "12px";

            fechaApunte.style.marginTop =
                "4px";


            const tituloApunte =
                document.createElement(
                    "div"
                );


            tituloApunte.textContent =
                apunte.titulo ||
                "Apunte";

            tituloApunte.style.color =
                "#d1d5db";

            tituloApunte.style.fontSize =
                "13px";

            tituloApunte.style.marginTop =
                "3px";


            item.appendChild(
                materia
            );

            item.appendChild(
                fechaApunte
            );

            item.appendChild(
                tituloApunte
            );


            item.addEventListener(
                "click",
                function() {

                    cargarApunteAnterior(
                        apunte
                    );

                    modal.remove();

                }
            );


            contenido.appendChild(
                item
            );
        }
    );


    const botonCerrar =
        document.createElement(
            "button"
        );


    botonCerrar.className =
        "btn-modal-cerrar";

    botonCerrar.textContent =
        "CERRAR";


    botonCerrar.addEventListener(
        "click",
        function() {

            volverAlContexto();

            modal.remove();

        }
    );


    contenido.appendChild(
        botonCerrar
    );


    modal.appendChild(
        contenido
    );


    document.body.appendChild(
        modal
    );
}


/* =========================================
   FORMATEAR FECHA
   ========================================= */

function formatearFechaApunte(
    fechaTexto
) {

    if (!fechaTexto) {

        return "";
    }


    const fecha =
        new Date(
            fechaTexto
        );


    if (
        Number.isNaN(
            fecha.getTime()
        )
    ) {

        return "";
    }


    return fecha.toLocaleDateString(
        "es-AR",
        {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* =========================================
   CARGAR APUNTE ANTERIOR
   ========================================= */

function cargarApunteAnterior(
    apunte
) {

    apunteActualId =
        apunte.id;


    materiaActual =
        apunte.materia;


    fechaCreacionActual =
        apunte.fecha_creacion
            ? new Date(
                apunte.fecha_creacion
            )
            : new Date();


    nota.value =
        apunte.contenido || "";


    actualizarContador();


    materiaSeleccionada.textContent =
        materiaActual;


    materiaSeleccionada.style.color =
        "#e5e7eb";


    estado.textContent =
        "Apunte anterior · " +
        materiaActual;


    mostrarMensaje(
        "✓ Apunte cargado"
    );


    nota.focus();


    crearBotonVolverActual();
}


/* =========================================
   BOTÓN VOLVER AL APUNTE ACTUAL
   ========================================= */

function crearBotonVolverActual() {

    eliminarBotonVolverActual();


    const boton =
        document.createElement(
            "button"
        );


    boton.id =
        "btnVolverActual";


    boton.textContent =
        "↩ VOLVER AL APUNTE ACTUAL";


    boton.style.position =
        "fixed";

    boton.style.bottom =
        "85px";

    boton.style.left =
        "50%";

    boton.style.transform =
        "translateX(-50%)";

    boton.style.zIndex =
        "200";

    boton.style.height =
        "42px";

    boton.style.padding =
        "0 16px";

    boton.style.border =
        "1px solid #374151";

    boton.style.borderRadius =
        "10px";

    boton.style.background =
        "#111827";

    boton.style.color =
        "#e5e7eb";

    boton.style.fontSize =
        "12px";

    boton.style.fontWeight =
        "700";

    boton.style.cursor =
        "pointer";


    boton.addEventListener(
        "click",
        function() {

            volverAlContexto();

        }
    );


    document.body.appendChild(
        boton
    );
}


/* =========================================
   ELIMINAR BOTÓN VOLVER
   ========================================= */

function eliminarBotonVolverActual() {

    const boton =
        document.getElementById(
            "btnVolverActual"
        );


    if (boton) {

        boton.remove();
    }
}


/* =========================================
   VOLVER AL APUNTE ACTUAL
   ========================================= */

async function volverAlContexto() {

    eliminarBotonVolverActual();


    if (
        !contextoApunteActual
    ) {

        return;
    }


    const contexto =
        contextoApunteActual;


    if (contexto.id) {

        const { data, error } =
            await supabaseClient
                .from("apuntes")
                .select(
                    "id, materia, fecha_creacion, contenido"
                )
                .eq(
                    "id",
                    contexto.id
                )
                .single();


        if (
            !error &&
            data
        ) {

            apunteActualId =
                data.id;

            materiaActual =
                data.materia;

            fechaCreacionActual =
                data.fecha_creacion
                    ? new Date(
                        data.fecha_creacion
                    )
                    : new Date();


            nota.value =
                data.contenido || "";


            actualizarContador();


            materiaSeleccionada.textContent =
                materiaActual;

            materiaSeleccionada.style.color =
                "#e5e7eb";


            estado.textContent =
                "Apunte actual · " +
                materiaActual;


            contextoApunteActual =
                null;


            mostrarMensaje(
                "↩ Volviste al apunte actual"
            );


            nota.focus();

            return;
        }
    }


    apunteActualId =
        contexto.id;


    materiaActual =
        contexto.materia;


    fechaCreacionActual =
        contexto.fechaCreacion
            ? new Date(
                contexto.fechaCreacion
            )
            : new Date();


    nota.value =
        contexto.contenido || "";


    actualizarContador();


    materiaSeleccionada.textContent =
        materiaActual;


    materiaSeleccionada.style.color =
        "#e5e7eb";


    estado.textContent =
        "Apunte actual · " +
        materiaActual;


    contextoApunteActual =
        null;


    mostrarMensaje(
        "↩ Volviste al apunte actual"
    );


    nota.focus();
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
        function(
            materia,
            indice
        ) {

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


            editar.type =
                "button";

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


            eliminar.type =
                "button";

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


    if (
        nombre === ""
    ) {

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

function editarMateria(
    indice
) {

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


    if (
        nombre === ""
    ) {

        return;
    }


    const existe =
        materias.some(
            function(
                materia,
                i
            ) {

                return (
                    i !== indice &&
                    materia === nombre
                );

            }
        );


    if (existe) {

        alert(
            "Esa materia ya existe."
        );

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
            "Apunte actual · " +
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

function eliminarMateria(
    indice
) {

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

        apunteActualId =
            null;

        fechaCreacionActual =
            null;

        nota.value =
            "";

        actualizarContador();


        materiaSeleccionada.textContent =
            "Seleccionar";


        materiaSeleccionada.style.color =
            "#9ca3af";


        estado.textContent =
            "Nueva captura";


        eliminarBotonVolverActual();
    }


    cargarMaterias();


    mostrarMateriasConfiguracion(
        materias
    );
}


/* =========================================
   EXPANSIÓN DEL ÁREA DE ESCRITURA
   ========================================= */

function iniciarExpansionEscritura() {

    const contenido =
        document.querySelector(
            ".contenido"
        );


    if (!contenido || !nota) {

        return;
    }


    /*
       COMPUTADORA:
       doble clic sobre el área de escritura.
    */

    nota.addEventListener(
        "dblclick",
        function() {

            alternarExpansionEscritura();

        }
    );


    /*
       PANTALLA TÁCTIL:
       doble toque sobre el área de escritura.
    */

    let ultimoToque = 0;


    nota.addEventListener(
        "touchend",
        function(event) {

            const ahora =
                Date.now();


            const diferencia =
                ahora - ultimoToque;


            if (
                diferencia > 0 &&
                diferencia < 350
            ) {

                event.preventDefault();

                alternarExpansionEscritura();

                ultimoToque = 0;

                return;
            }


            ultimoToque =
                ahora;
        },
        {
            passive: false
        }
    );
}


function alternarExpansionEscritura() {

    const contenido =
        document.querySelector(
            ".contenido"
        );


    if (!contenido) {

        return;
    }


    contenido.classList.toggle(
        "contenido-expandido"
    );


    /*
       Dejamos nuevamente el cursor
       dentro del apunte.
    */

    nota.focus();


    if (
        contenido.classList.contains(
            "contenido-expandido"
        )
    ) {

        console.log(
            "Área de escritura expandida."
        );

    } else {

        console.log(
            "Área de escritura normal."
        );
    }
}


/* =========================================
   PROTECCIÓN AL SALIR
   ========================================= */

window.addEventListener(
    "beforeunload",
    function() {

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