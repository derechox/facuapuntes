/* =========================================
   MIS APUNTES
   SUPABASE + APUNTES CONTINUOS

   - UN APUNTE CONTINUO POR MATERIA
   - FECHA Y HORA UNA SOLA VEZ POR DÍA
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
   BOTONES
   ========================================= */

const btnCompartir =
    document.getElementById("btnCompartir");

const btnTexto =
    document.getElementById("btnTexto");

const btnIA =
    document.getElementById("btnIA");


/* =========================================
   MENÚ COMPARTIR
   ========================================= */

const menuCompartir =
    document.getElementById("menuCompartir");

const btnWhatsApp =
    document.getElementById("btnWhatsApp");

const btnPDF =
    document.getElementById("btnPDF");

const btnWord =
    document.getElementById("btnWord");

const btnImprimir =
    document.getElementById("btnImprimir");


/* =========================================
   ESTADO ACTUAL
   ========================================= */

let materiaActual = "";

let apunteActualId = null;

let fechaCreacionActual = null;

let guardadoAutomatico = null;

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
        "Mis Apuntes iniciado."
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


        await cargarApunteContinuo(
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
   FECHA DEL ENCABEZADO SUPERIOR
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
   FECHA PARA MOSTRAR DENTRO DEL APUNTE
   ========================================= */

function obtenerFechaVisible() {

    const ahora =
        new Date();


    const dia =
        String(
            ahora.getDate()
        ).padStart(
            2,
            "0"
        );


    const mes =
        String(
            ahora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const año =
        ahora.getFullYear();


    return (
        dia +
        "/" +
        mes +
        "/" +
        año
    );
}


/* =========================================
   HORA PARA MOSTRAR DENTRO DEL APUNTE
   ========================================= */

function obtenerHoraVisible() {

    const ahora =
        new Date();


    const horas =
        String(
            ahora.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutos =
        String(
            ahora.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return (
        horas +
        ":" +
        minutos
    );
}


/* =========================================
   ENCABEZADO DEL DÍA
   ========================================= */

function obtenerEncabezadoDelDia() {

    return (
        obtenerFechaVisible() +
        " - " +
        obtenerHoraVisible()
    );
}


/* =========================================
   COMPROBAR SI YA EXISTE EL ENCABEZADO
   DEL DÍA ACTUAL
   ========================================= */

function tieneEncabezadoDeHoy(contenido) {

    if (
        !contenido
    ) {

        return false;
    }


    const fechaHoy =
        obtenerFechaVisible();


    const patron =
        new RegExp(
            "(^|\\n)" +
            fechaHoy.replace(
                /\//g,
                "\\/"
            ) +
            "\\s*-\\s*\\d{2}:\\d{2}"
        );


    return patron.test(
        contenido
    );
}


/* =========================================
   AGREGAR ENCABEZADO DEL DÍA
   ========================================= */

function asegurarEncabezadoDelDia() {

    if (
        cargandoApunte
    ) {

        return false;
    }


    if (
        materiaActual === ""
    ) {

        return false;
    }


    const contenido =
        nota.value;


    if (
        tieneEncabezadoDeHoy(
            contenido
        )
    ) {

        return false;
    }


    const encabezado =
        obtenerEncabezadoDelDia();


    if (
        contenido.trim() === ""
    ) {

        nota.value =
            encabezado +
            "\n\n";

    } else {

        const separador =
            contenido.endsWith("\n")
                ? "\n"
                : "\n\n";


        nota.value =
            contenido +
            separador +
            encabezado +
            "\n\n";
    }


    nota.selectionStart =
        nota.value.length;

    nota.selectionEnd =
        nota.value.length;


    actualizarContador();

    guardarBorradorLocal();


    return true;
}


/* =========================================
   MATERIAS
   ========================================= */

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


function guardarMaterias(
    materias
) {

    localStorage.setItem(

        STORAGE_MATERIAS,

        JSON.stringify(
            materias
        )

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


    await cargarApunteContinuo(
        materia
    );
}


/* =========================================
   CARGAR APUNTE CONTINUO
   ========================================= */

async function cargarApunteContinuo(
    materia
) {

    estado.textContent =
        "Buscando apunte · " +
        materia;


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

            .order(
                "fecha_modificacion",
                {
                    ascending: false
                }
            )

            .limit(1);


    if (error) {

        console.error(
            "Error buscando apunte:",
            error
        );


        iniciarNuevoApunteSinGuardar();


        recuperarBorradorLocal(
            materia
        );


        mostrarMensaje(
            "No se pudo consultar el apunte."
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
            apunte
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


    cargandoApunte = false;


    nota.focus();
}


/* =========================================
   CARGAR APUNTE EN PANTALLA
   ========================================= */

function cargarApunteEnPantalla(
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
        "Apunte · " +
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


    nota.selectionStart =
        nota.value.length;

    nota.selectionEnd =
        nota.value.length;
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
   FECHA ANTES DE ESCRIBIR
   ========================================= */

nota.addEventListener(
    "beforeinput",
    function(event) {

        const tiposDeEntrada =
            [
                "insertText",
                "insertReplacementText",
                "insertFromPaste",
                "insertFromDrop"
            ];


        if (
            tiposDeEntrada.includes(
                event.inputType
            )
        ) {

            asegurarEncabezadoDelDia();

        }
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
   ACTUALIZAR CONTADOR
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


    nota.selectionStart =
        nota.value.length;

    nota.selectionEnd =
        nota.value.length;
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

    let texto =
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


    if (
        !tieneEncabezadoDeHoy(
            nota.value
        )
    ) {

        asegurarEncabezadoDelDia();

        texto =
            nota.value.trim();
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

                .order(
                    "fecha_modificacion",
                    {
                        ascending: false
                    }
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

                    .order(
                        "fecha_modificacion",
                        {
                            ascending: false
                        }
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
   ACTUALIZAR APUNTE CONTINUO
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
            .split("\n")
            .find(
                function(linea) {

                    return linea.trim() !== "";

                }
            )
            ?.trim() || "";


    const lineas =
        texto.split("\n");


    let titulo =
        "";


    for (
        let i = 0;
        i < lineas.length;
        i++
    ) {

        const linea =
            lineas[i].trim();


        if (
            linea === ""
        ) {

            continue;
        }


        if (
            /^\d{2}\/\d{2}\/\d{4}\s*-\s*\d{2}:\d{2}$/.test(
                linea
            )
        ) {

            continue;
        }


        titulo =
            linea;


        break;
    }


    if (
        titulo.length > 80
    ) {

        return titulo.substring(
            0,
            80
        );
    }


    return titulo ||
        primeraLinea ||
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


    materias.push(
        nombre
    );


    guardarMaterias(
        materias
    );


    nuevaMateria.value =
        "";


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
                "No se pudieron actualizar los apuntes:",
                error
            );
        }

    } catch (error) {

        console.error(
            "Error actualizando apuntes:",
            error
        );
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
   MENÚ COMPARTIR
   ========================================= */

btnCompartir.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        menuCompartir.classList.toggle(
            "abierto"
        );
    }
);


/* =========================================
   MANDAR POR WHATSAPP
   ========================================= */

btnWhatsApp.addEventListener(
    "click",
    function() {

        const texto =
            nota.value.trim();


        if (
            texto === ""
        ) {

            mostrarMensaje(
                "No hay nada para compartir."
            );

            return;
        }


        const mensajeWhatsApp =
            materiaActual
                ? "📚 " +
                  materiaActual +
                  "\n\n" +
                  texto
                : texto;


        const url =
            "https://wa.me/?text=" +
            encodeURIComponent(
                mensajeWhatsApp
            );


        window.open(
            url,
            "_blank"
        );


        menuCompartir.classList.remove(
            "abierto"
        );
    }
);


/* =========================================
   EXPORTAR PDF
   ========================================= */

btnPDF.addEventListener(
    "click",
    function() {

        const texto =
            nota.value.trim();


        if (
            texto === ""
        ) {

            mostrarMensaje(
                "No hay nada para exportar."
            );

            return;
        }


        if (
            !window.jspdf ||
            !window.jspdf.jsPDF
        ) {

            mostrarMensaje(
                "No se pudo cargar el exportador PDF."
            );

            return;
        }


        const {
            jsPDF
        } =
            window.jspdf;


        const pdf =
            new jsPDF({
                unit: "mm",
                format: "a4"
            });


        const margen =
            18;


        const ancho =
            210 -
            margen * 2;


        const lineas =
            pdf.splitTextToSize(
                texto,
                ancho
            );


        let y =
            margen;


        const alturaLinea =
            7;


        lineas.forEach(
            function(linea) {

                if (
                    y >
                    297 - margen
                ) {

                    pdf.addPage();

                    y =
                        margen;
                }


                pdf.text(
                    linea,
                    margen,
                    y
                );


                y +=
                    alturaLinea;
            }
        );


        const nombreArchivo =
            materiaActual
                ? materiaActual
                      .toLowerCase()
                      .replace(
                          /[^a-z0-9áéíóúüñ]+/gi,
                          "_"
                      )
                : "mis_apuntes";


        pdf.save(
            nombreArchivo +
            ".pdf"
        );


        menuCompartir.classList.remove(
            "abierto"
        );


        mostrarMensaje(
            "✓ PDF exportado"
        );
    }
);


/* =========================================
   EXPORTAR WORD
   ========================================= */

btnWord.addEventListener(
    "click",
    function() {

        const texto =
            nota.value.trim();


        if (
            texto === ""
        ) {

            mostrarMensaje(
                "No hay nada para exportar."
            );

            return;
        }


        const textoSeguro =
            texto
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                );


        const contenidoHTML =
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<title>Mis Apuntes</title>" +
            "</head>" +
            "<body>" +
            "<pre style='font-family: Arial; font-size: 12pt; white-space: pre-wrap;'>" +
            textoSeguro +
            "</pre>" +
            "</body>" +
            "</html>";


        const blob =
            new Blob(
                [
                    "\ufeff",
                    contenidoHTML
                ],
                {
                    type:
                        "application/msword"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const enlace =
            document.createElement(
                "a"
            );


        enlace.href =
            url;


        enlace.download =
            (
                materiaActual ||
                "mis_apuntes"
            ) +
            ".doc";


        document.body.appendChild(
            enlace
        );


        enlace.click();


        document.body.removeChild(
            enlace
        );


        URL.revokeObjectURL(
            url
        );


        menuCompartir.classList.remove(
            "abierto"
        );


        mostrarMensaje(
            "✓ Word exportado"
        );
    }
);


/* =========================================
   IMPRIMIR
   ========================================= */

btnImprimir.addEventListener(
    "click",
    function() {

        const texto =
            nota.value.trim();


        if (
            texto === ""
        ) {

            mostrarMensaje(
                "No hay nada para imprimir."
            );

            return;
        }


        const ventana =
            window.open(
                "",
                "_blank"
            );


        if (
            !ventana
        ) {

            mostrarMensaje(
                "El navegador bloqueó la ventana de impresión."
            );

            return;
        }


        const textoHTML =
            texto
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /\n/g,
                    "<br>"
                );


        ventana.document.write(
            "<!DOCTYPE html>" +
            "<html lang='es'>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<title>Mis Apuntes</title>" +
            "<style>" +
            "body {" +
            "font-family: Arial, sans-serif;" +
            "font-size: 12pt;" +
            "line-height: 1.6;" +
            "margin: 25mm;" +
            "color: #000;" +
            "}" +
            "</style>" +
            "</head>" +
            "<body>" +
            textoHTML +
            "</body>" +
            "</html>"
        );


        ventana.document.close();


        ventana.focus();


        setTimeout(
            function() {

                ventana.print();

            },
            300
        );


        menuCompartir.classList.remove(
            "abierto"
        );
    }
);


/* =========================================
   CERRAR MENÚ COMPARTIR AL HACER CLIC AFUERA
   ========================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(
                ".compartir-contenedor"
            )
        ) {

            menuCompartir.classList.remove(
                "abierto"
            );
        }
    }
);


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
