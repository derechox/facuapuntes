/* =========================================
   FACU-APUNTES
   SUPABASE + APUNTES ANTERIORES

   - UN APUNTE POR MATERIA Y POR DÍA
   - VOLVER AL APUNTE ACTUAL
   - AUTOGUARDADO
   - COPIA LOCAL DE SEGURIDAD
   - RECUPERAR ÚLTIMA MATERIA
   - MATERIAS SINCRONIZADAS CON SUPABASE
   ========================================= */


/* =========================================
   CONFIGURACIÓN
   ========================================= */

const MATERIAS_POR_DEFECTO = [
    "COMERCIAL",
    "CONTRATOS",
    "PROCESAL"
];

const STORAGE_MATERIAS =
    "derecho_uba_materias";

const STORAGE_BORRADOR =
    "facu_apuntes_borrador_actual";

const STORAGE_ULTIMA_MATERIA =
    "facu_apuntes_ultima_materia";


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
   BOTONES NUEVOS
   ========================================= */

const btnCompartir =
    document.getElementById("btnCompartir");

const btnTexto =
    document.getElementById("btnTexto");

const btnIA =
    document.getElementById("btnIA");


/* =========================================
   ESTADO ACTUAL
   ========================================= */

let materiaActual = "";

let apunteActualId = null;

let fechaCreacionActual = null;

let guardadoAutomatico = null;

let contextoApunteActual = null;

let cargandoApunte = false;


/* =========================================
   INICIO
   ========================================= */

iniciar();


async function iniciar() {

    await cargarMaterias();

    actualizarFecha();

    actualizarContador();

    iniciarGuardadoAutomatico();


    console.log(
        "Facu Apuntes iniciado."
    );


    let ultimaMateria = null;


    try {

        ultimaMateria =
            localStorage.getItem(
                STORAGE_ULTIMA_MATERIA
            );

    } catch (error) {

        console.error(
            "No se pudo recuperar la última materia:",
            error
        );
    }


    if (
        ultimaMateria &&
        obtenerMaterias().includes(
            ultimaMateria
        )
    ) {

        materiaActual =
            ultimaMateria;


        materiaSeleccionada.textContent =
            ultimaMateria;


        materiaSeleccionada.style.color =
            "#e5e7eb";


        await cargarApunteDeHoy(
            ultimaMateria
        );


        return;
    }


    materiaSeleccionada.textContent =
        "Seleccionar";


    estado.textContent =
        "Nueva captura";
}


/* =========================================
   FECHA
   ========================================= */

function actualizarFecha() {

    const ahora =
        new Date();


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
   FECHA DEL DÍA PARA SUPABASE
   ========================================= */

function obtenerFechaDia() {

    const ahora =
        new Date();


    const año =
        ahora.getFullYear();


    const mes =
        String(
            ahora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            ahora.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        año +
        "-" +
        mes +
        "-" +
        dia
    );
}


/* =========================================
   INICIO DEL DÍA
   ========================================= */

function obtenerInicioDelDia() {

    const ahora =
        new Date();


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


/* =========================================
   FIN DEL DÍA
   ========================================= */

function obtenerFinDelDia() {

    const ahora =
        new Date();


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

/*
   IMPORTANTE:

   localStorage sigue funcionando como
   copia local.

   Supabase es el lugar donde se sincronizan
   las materias entre dispositivos.
*/

async function cargarMaterias() {

    let materiasLocales;


    try {

        materiasLocales =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_MATERIAS
                )
            );

    } catch (error) {

        materiasLocales = null;
    }


    if (
        !Array.isArray(materiasLocales) ||
        materiasLocales.length === 0
    ) {

        materiasLocales = [
            ...MATERIAS_POR_DEFECTO
        ];
    }


    mostrarMateriasMenu(
        materiasLocales
    );


    mostrarMateriasConfiguracion(
        materiasLocales
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient

                .from("materias")

                .select(
                    "nombre"
                )

                .order(
                    "nombre",
                    {
                        ascending: true
                    }
                );


        if (
            error
        ) {

            throw error;
        }


        let materiasSupabase =
            (data || [])
                .map(
                    function(materia) {

                        return String(
                            materia.nombre
                        )
                            .trim()
                            .toUpperCase();

                    }
                )
                .filter(
                    function(nombre) {

                        return nombre !== "";

                    }
                );


        if (
            materiasSupabase.length === 0
        ) {

            const materiasIniciales =
                [
                    ...new Set(
                        [
                            ...MATERIAS_POR_DEFECTO,
                            ...materiasLocales
                        ]
                    )
                ];


            const filas =
                materiasIniciales.map(
                    function(nombre) {

                        return {
                            nombre: nombre
                        };

                    }
                );


            const {
                error: errorInsert
            } =
                await supabaseClient

                    .from("materias")

                    .upsert(
                        filas,
                        {
                            onConflict: "nombre"
                        }
                    );


            if (
                errorInsert
            ) {

                throw errorInsert;
            }


            materiasSupabase =
                materiasIniciales;
        }


        guardarMaterias(
            materiasSupabase
        );


        mostrarMateriasMenu(
            materiasSupabase
        );


        mostrarMateriasConfiguracion(
            materiasSupabase
        );


        console.log(
            "Materias sincronizadas:",
            materiasSupabase
        );


    } catch (error) {

        console.error(
            "No se pudieron sincronizar las materias:",
            error
        );


        guardarMaterias(
            materiasLocales
        );


        mostrarMateriasMenu(
            materiasLocales
        );


        mostrarMateriasConfiguracion(
            materiasLocales
        );
    }
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

function mostrarMateriasMenu(
    materias
) {

    menuMateria.innerHTML = "";


    materias.forEach(
        function(materia) {

            const boton =
                document.createElement(
                    "button"
                );


            boton.type =
                "button";


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
        document.createElement(
            "div"
        );


    separadorApuntes.className =
        "separador";


    menuMateria.appendChild(
        separadorApuntes
    );


    const apuntesAnteriores =
        document.createElement(
            "button"
        );


    apuntesAnteriores.type =
        "button";


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
        document.createElement(
            "div"
        );


    separadorConfiguracion.className =
        "separador";


    menuMateria.appendChild(
        separadorConfiguracion
    );


    const configuracion =
        document.createElement(
            "button"
        );


    configuracion.type =
        "button";


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

        contextoApunteActual =
            null;


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

async function seleccionarMateria(
    materia
) {

    menuMateria.classList.add(
        "oculto"
    );


    if (
        materiaActual === materia
    ) {

        nota.focus();


        return;
    }


    /*
       Guardamos antes de cambiar
       de materia.
    */

    if (
        materiaActual !== "" &&
        nota.value.trim() !== ""
    ) {

        await guardarNota(true);
    }


    materiaActual =
        materia;


    try {

        localStorage.setItem(

            STORAGE_ULTIMA_MATERIA,

            materia

        );

    } catch (error) {

        console.error(
            "No se pudo guardar la última materia:",
            error
        );
    }


    await cargarApunteDeHoy(
        materia
    );
}


/* =========================================
   CARGAR APUNTE DE HOY
   ========================================= */

async function cargarApunteDeHoy(
    materia
) {

    estado.textContent =
        "Buscando apunte de hoy · " +
        materia;


    const fechaDia =
        obtenerFechaDia();


    const {
        data,
        error
    } =
        await supabaseClient

            .from("apuntes")

            .select(
                "id, materia, fecha_dia, fecha_creacion, fecha_modificacion, titulo, contenido"
            )

            .eq(
                "materia",
                materia
            )

            .eq(
                "fecha_dia",
                fechaDia
            )

            .limit(1);


    if (error) {

        console.error(
            "Error buscando apunte de hoy:",
            error
        );


        iniciarNuevoApunteSinGuardar();


        recuperarBorradorLocal(
            materia
        );


        mostrarMensaje(
            "No se pudo consultar el apunte de hoy."
        );


        return;
    }


    if (
        data &&
        data.length > 0
    ) {

        const apunte =
            data[0];


        cargarApunteEnPantalla(
            apunte,
            "Apunte de hoy · "
        );


        recuperarBorradorLocal(
            materia,
            apunte
        );


        return;
    }


    iniciarNuevoApunteSinGuardar();


    recuperarBorradorLocal(
        materia
    );
}


/* =========================================
   NUEVO APUNTE SIN GUARDAR
   ========================================= */

function iniciarNuevoApunteSinGuardar() {

    cargandoApunte = true;


    apunteActualId =
        null;


    fechaCreacionActual =
        new Date();


    nota.value =
        "";


    actualizarContador();


    materiaSeleccionada.textContent =
        materiaActual ||
        "Seleccionar";


    if (
        materiaActual !== ""
    ) {

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


    cargandoApunte = false;


    nota.focus();
}


/* =========================================
   CARGAR APUNTE EN PANTALLA
   ========================================= */

function cargarApunteEnPantalla(
    apunte,
    textoEstado
) {

    cargandoApunte = true;


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


    try {

        localStorage.setItem(

            STORAGE_ULTIMA_MATERIA,

            materiaActual

        );

    } catch (error) {

        console.error(
            "No se pudo guardar la última materia:",
            error
        );
    }


    cargandoApunte = false;


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
    function() {

        actualizarContador();

        guardarBorradorLocal();

    }
);


/* =========================================
   EXPANDIR HORIZONTALMENTE
   DOBLE CLIC
   ========================================= */

nota.addEventListener(
    "dblclick",
    function() {

        if (
            nota.classList.contains(
                "textarea-expandido"
            )
        ) {

            nota.classList.remove(
                "textarea-expandido"
            );

            nota.style.height = "";

        } else {

            const altoActual =
                nota.getBoundingClientRect().height;


            nota.style.height =
                altoActual + "px";


            nota.classList.add(
                "textarea-expandido"
            );
        }

    }
);


/* =========================================
   CONTADOR
   ========================================= */

function actualizarContador() {

    contador.textContent =
        nota.value.length +
        " caracteres";
}


/* =========================================
   COPIA LOCAL DE SEGURIDAD
   ========================================= */

function guardarBorradorLocal() {

    if (
        cargandoApunte
    ) {

        return;
    }


    if (
        materiaActual === ""
    ) {

        return;
    }


    if (
        nota.value.trim() === ""
    ) {

        eliminarBorradorLocal();


        return;
    }


    const borrador = {

        id:
            apunteActualId,

        materia:
            materiaActual,

        contenido:
            nota.value,

        fechaCreacion:
            fechaCreacionActual
                ? fechaCreacionActual.toISOString()
                : new Date().toISOString(),

        fechaDia:
            obtenerFechaDia(),

        fechaBorrador:
            new Date().toISOString()

    };


    try {

        localStorage.setItem(

            STORAGE_BORRADOR,

            JSON.stringify(
                borrador
            )

        );


        estado.textContent =
            "Borrador local · " +
            materiaActual;

    } catch (error) {

        console.error(
            "No se pudo guardar el borrador local:",
            error
        );
    }
}


/* =========================================
   RECUPERAR BORRADOR LOCAL
   ========================================= */

function recuperarBorradorLocal(
    materia,
    apunteSupabase = null
) {

    let borrador;


    try {

        borrador =
            JSON.parse(

                localStorage.getItem(
                    STORAGE_BORRADOR
                )

            );

    } catch (error) {

        borrador = null;
    }


    if (
        !borrador
    ) {

        return;
    }


    if (
        borrador.materia !== materia
    ) {

        return;
    }


    if (
        borrador.fechaDia &&
        borrador.fechaDia !== obtenerFechaDia()
    ) {

        return;
    }


    const fechaBorrador =
        new Date(
            borrador.fechaBorrador
        );


    if (
        Number.isNaN(
            fechaBorrador.getTime()
        )
    ) {

        return;
    }


    if (
        apunteSupabase &&
        apunteSupabase.fecha_modificacion
    ) {

        const fechaServidor =
            new Date(
                apunteSupabase.fecha_modificacion
            );


        if (
            !Number.isNaN(
                fechaServidor.getTime()
            ) &&
            fechaBorrador <= fechaServidor
        ) {

            eliminarBorradorLocal();


            return;
        }
    }


    if (
        apunteSupabase &&
        borrador.id &&
        borrador.id !== apunteSupabase.id
    ) {

        return;
    }


    cargandoApunte = true;


    apunteActualId =
        borrador.id || null;


    materiaActual =
        borrador.materia;


    fechaCreacionActual =
        borrador.fechaCreacion
            ? new Date(
                borrador.fechaCreacion
            )
            : new Date();


    nota.value =
        borrador.contenido || "";


    actualizarContador();


    materiaSeleccionada.textContent =
        materiaActual;


    materiaSeleccionada.style.color =
        "#e5e7eb";


    estado.textContent =
        "✓ Borrador recuperado · " +
        materiaActual;


    try {

        localStorage.setItem(

            STORAGE_ULTIMA_MATERIA,

            materiaActual

        );

    } catch (error) {

        console.error(
            "No se pudo guardar la última materia:",
            error
        );
    }


    cargandoApunte = false;


    mostrarMensaje(
        "✓ Recuperamos lo que estabas escribiendo"
    );


    nota.focus();
}


/* =========================================
   ELIMINAR BORRADOR LOCAL
   ========================================= */

function eliminarBorradorLocal() {

    try {

        localStorage.removeItem(
            STORAGE_BORRADOR
        );

    } catch (error) {

        console.error(
            "No se pudo eliminar el borrador local:",
            error
        );
    }
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


async function guardarNota(
    esAutomatico
) {

    const texto =
        nota.value.trim();


    if (
        texto === ""
    ) {

        eliminarBorradorLocal();


        if (
            !esAutomatico
        ) {

            mostrarMensaje(
                "No hay nada para guardar."
            );
        }


        return false;
    }


    if (
        materiaActual === ""
    ) {

        if (
            !esAutomatico
        ) {

            mostrarMensaje(
                "Primero elegí una materia."
            );
        }


        return false;
    }


    const fechaDia =
        obtenerFechaDia();


    if (
        !apunteActualId
    ) {

        const {
            data: existente,
            error: errorBusqueda
        } =
            await supabaseClient

                .from("apuntes")

                .select(
                    "id, materia, fecha_dia, fecha_creacion, fecha_modificacion, contenido"
                )

                .eq(
                    "materia",
                    materiaActual
                )

                .eq(
                    "fecha_dia",
                    fechaDia
                )

                .limit(1);


        if (
            errorBusqueda
        ) {

            console.error(
                "Error comprobando apunte existente:",
                errorBusqueda
            );


            guardarBorradorLocal();


            if (
                !esAutomatico
            ) {

                mostrarMensaje(
                    "No se pudo consultar Supabase. El borrador quedó guardado localmente."
                );
            }


            return false;
        }


        if (
            existente &&
            existente.length > 0
        ) {

            apunteActualId =
                existente[0].id;


            fechaCreacionActual =
                existente[0].fecha_creacion
                    ? new Date(
                        existente[0].fecha_creacion
                    )
                    : new Date();
        }
    }


    if (
        !apunteActualId
    ) {

        const fechaCreacion =
            fechaCreacionActual ||
            new Date();


        const {
            data,
            error
        } =
            await supabaseClient

                .from("apuntes")

                .insert({

                    materia:
                        materiaActual,

                    fecha_dia:
                        fechaDia,

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


        if (
            error
        ) {

            console.error(
                "Error al crear apunte:",
                error
            );


            const {
                data: recuperado,
                error: errorRecuperacion
            } =
                await supabaseClient

                    .from("apuntes")

                    .select(
                        "id, materia, fecha_dia, fecha_creacion, fecha_modificacion, contenido"
                    )

                    .eq(
                        "materia",
                        materiaActual
                    )

                    .eq(
                        "fecha_dia",
                        fechaDia
                    )

                    .limit(1);


            if (
                !errorRecuperacion &&
                recuperado &&
                recuperado.length > 0
            ) {

                apunteActualId =
                    recuperado[0].id;


                fechaCreacionActual =
                    recuperado[0].fecha_creacion
                        ? new Date(
                            recuperado[0].fecha_creacion
                        )
                        : new Date();


                return await actualizarApunteExistente(
                    texto,
                    esAutomatico
                );
            }


            guardarBorradorLocal();


            if (
                !esAutomatico
            ) {

                mostrarMensaje(
                    "No se pudo sincronizar. El borrador quedó guardado localmente."
                );
            }


            return false;
        }


        apunteActualId =
            data.id;


        fechaCreacionActual =
            data.fecha_creacion
                ? new Date(
                    data.fecha_creacion
                )
                : fechaCreacion;


        eliminarBorradorLocal();


        estado.textContent =
            "Guardada · " +
            materiaActual;


        if (
            !esAutomatico
        ) {

            mostrarMensaje(
                "✓ Apunte guardado"
            );
        }


        return true;
    }


    return await actualizarApunteExistente(
        texto,
        esAutomatico
    );
}


/* =========================================
   ACTUALIZAR APUNTE EXISTENTE
   ========================================= */

async function actualizarApunteExistente(
    texto,
    esAutomatico
) {

    const ahora =
        new Date();


    const {
        error
    } =
        await supabaseClient

            .from("apuntes")

            .update({

                materia:
                    materiaActual,

                fecha_dia:
                    obtenerFechaDia(),

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


    if (
        error
    ) {

        console.error(
            "Error al actualizar:",
            error
        );


        guardarBorradorLocal();


        if (
            !esAutomatico
        ) {

            mostrarMensaje(
                "No se pudo sincronizar. El borrador quedó guardado localmente."
            );
        }


        return false;
    }


    eliminarBorradorLocal();


    estado.textContent =
        "Actualizada · " +
        materiaActual;


    if (
        !esAutomatico
    ) {

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


    if (
        texto === ""
    ) {

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

    if (
        guardadoAutomatico
    ) {

        clearInterval(
            guardadoAutomatico
        );
    }


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
   MENSAJES
   ========================================= */

function mostrarMensaje(
    texto
) {

    mensaje.textContent =
        texto;


    setTimeout(
        function() {

            mensaje.textContent =
                "";

        },
        2500
    );
}


/* =========================================
   APUNTES ANTERIORES
   ========================================= */

async function abrirApuntesAnteriores() {

    mostrarMensaje(
        "Buscando apuntes..."
    );


    const {
        data,
        error
    } =
        await supabaseClient

            .from("apuntes")

            .select(
                "id, materia, fecha_dia, fecha_creacion, fecha_modificacion, titulo, contenido"
            )

            .order(
                "fecha_creacion",
                {
                    ascending: false
                }
            );


    if (
        error
    ) {

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

function mostrarListaApuntes(
    apuntes
) {

    const modalExistente =
        document.getElementById(
            "modalApuntes"
        );


    if (
        modalExistente
    ) {

        modalExistente.remove();
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "modalApuntes";


    modal.className =
        "modal";


    const contenido =
        document.createElement(
            "div"
        );


    contenido.className =
        "modal-contenido";


    const encabezado =
        document.createElement(
            "div"
        );


    encabezado.className =
        "modal-header";


    const titulo =
        document.createElement(
            "h2"
        );


    titulo.textContent =
        "MIS APUNTES";


    const cerrar =
        document.createElement(
            "button"
        );


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
            document.createElement(
                "p"
            );


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

    if (
        !fechaTexto
    ) {

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

    cargandoApunte = true;


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


    try {

        localStorage.setItem(

            STORAGE_ULTIMA_MATERIA,

            materiaActual

        );

    } catch (error) {

        console.error(
            "No se pudo guardar la última materia:",
            error
        );
    }


    cargandoApunte = false;


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


    if (
        boton
    ) {

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


    if (
        contexto.id
    ) {

        const {
            data,
            error
        } =
            await supabaseClient

                .from("apuntes")

                .select(
                    "id, materia, fecha_dia, fecha_creacion, contenido"
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


            try {

                localStorage.setItem(

                    STORAGE_ULTIMA_MATERIA,

                    materiaActual

                );

            } catch (error) {

                console.error(
                    "No se pudo guardar la última materia:",
                    error
                );
            }


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


    try {

        localStorage.setItem(

            STORAGE_ULTIMA_MATERIA,

            materiaActual

        );

    } catch (error) {

        console.error(
            "No se pudo guardar la última materia:",
            error
        );
    }


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


async function agregarMateria() {

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


    if (
        existe
    ) {

        alert(
            "Esa materia ya existe."
        );


        return;
    }


    /*
       PRIMERO GUARDAMOS EN SUPABASE.
    */

    try {

        const {
            error
        } =
            await supabaseClient

                .from("materias")

                .insert({

                    nombre:
                        nombre

                });


        if (
            error
        ) {

            /*
               Código 23505 =
               materia duplicada.
            */

            if (
                error.code === "23505"
            ) {

                alert(
                    "Esa materia ya existe."
                );


                await cargarMaterias();

                return;
            }


            throw error;
        }


    } catch (error) {

        console.error(
            "Error agregando materia en Supabase:",
            error
        );


        alert(
            "No se pudo guardar la materia en Supabase."
        );


        return;
    }


    /*
       Supabase confirmó.
       Ahora actualizamos la copia local.
    */

    materias.push(
        nombre
    );


    guardarMaterias(
        materias
    );


    nuevaMateria.value =
        "";


    /*
       Recargamos desde Supabase
       para que ambos dispositivos
       tengan exactamente la misma lista.
    */

    await cargarMaterias();


    mostrarMateriasConfiguracion(
        obtenerMaterias()
    );


    mostrarMensaje(
        "✓ Materia agregada"
    );
}


/* =========================================
   EDITAR MATERIA
   ========================================= */

async function editarMateria(
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


    if (
        existe
    ) {

        alert(
            "Esa materia ya existe."
        );


        return;
    }


    /*
       Actualizamos Supabase.
    */

    try {

        const {
            error
        } =
            await supabaseClient

                .from("materias")

                .update({

                    nombre:
                        nombre

                })

                .eq(
                    "nombre",
                    actual
                );


        if (
            error
        ) {

            throw error;
        }


    } catch (error) {

        console.error(
            "Error editando materia en Supabase:",
            error
        );


        alert(
            "No se pudo modificar la materia."
        );


        return;
    }


    /*
       Actualizamos también los apuntes
       existentes de esa materia.
    */

    try {

        const {
            error
        } =
            await supabaseClient

                .from("apuntes")

                .update({

                    materia:
                        nombre

                })

                .eq(
                    "materia",
                    actual
                );


        if (
            error
        ) {

            console.error(
                "No se pudieron actualizar los apuntes antiguos:",
                error
            );
        }

    } catch (error) {

        console.error(
            "Error actualizando apuntes:",
            error
        );
    }


    /*
       Actualizamos copia local.
    */

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


        try {

            localStorage.setItem(

                STORAGE_ULTIMA_MATERIA,

                nombre

            );

        } catch (error) {

            console.error(
                "No se pudo guardar la última materia:",
                error
            );
        }
    }


    await cargarMaterias();


    mostrarMateriasConfiguracion(
        obtenerMaterias()
    );
}


/* =========================================
   ELIMINAR MATERIA
   ========================================= */

async function eliminarMateria(
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


    if (
        !confirmar
    ) {

        return;
    }


    /*
       Eliminamos de Supabase.
    */

    try {

        const {
            error
        } =
            await supabaseClient

                .from("materias")

                .delete()

                .eq(
                    "nombre",
                    materia
                );


        if (
            error
        ) {

            throw error;
        }


    } catch (error) {

        console.error(
            "Error eliminando materia en Supabase:",
            error
        );


        alert(
            "No se pudo eliminar la materia."
        );


        return;
    }


    /*
       Actualizamos copia local.
    */

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


        eliminarBorradorLocal();


        try {

            localStorage.removeItem(
                STORAGE_ULTIMA_MATERIA
            );

        } catch (error) {

            console.error(
                "No se pudo eliminar la última materia:",
                error
            );
        }
    }


    await cargarMaterias();


    mostrarMateriasConfiguracion(
        obtenerMaterias()
    );
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

            guardarBorradorLocal();
        }


        if (
            materiaActual !== ""
        ) {

            try {

                localStorage.setItem(

                    STORAGE_ULTIMA_MATERIA,

                    materiaActual

                );

            } catch (error) {

                console.error(
                    "No se pudo guardar la última materia:",
                    error
                );
            }
        }
    }
);