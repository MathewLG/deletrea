// @ts-check
/**
 * Every user-facing string. Spanish, tuteo, short. No em dashes, no exclamation chains.
 */

/** @typedef {'thumb'|'index'|'middle'|'ring'|'pinky'} FingerName */

/** @type {Record<FingerName, string>} */
export const FINGER_NAMES = {
  thumb: 'pulgar',
  index: 'índice',
  middle: 'medio',
  ring: 'anular',
  pinky: 'meñique',
};

/** @param {FingerName|undefined} f */
const fname = (f) => (f ? `el ${FINGER_NAMES[f]}` : 'ese dedo');
/** @param {FingerName|undefined} f */
const ofFinger = (f) => (f ? `del ${FINGER_NAMES[f]}` : 'de ese dedo');

/**
 * Hint text for every code in SPEC 5.3.
 * @type {Record<string, (h: {finger?: FingerName, other?: FingerName}) => string>}
 */
export const HINTS = {
  palm_to_camera: () => 'Gira la palma hacia la cámara',
  palm_to_self: () => 'Gira la palma hacia ti',
  palm_sideways: () => 'Pon la mano de lado',
  point_up: () => 'Apunta los dedos hacia arriba',
  point_down: () => 'Apunta los dedos hacia abajo',
  point_side: () => 'Apunta los dedos hacia un lado',
  curl_more: (h) => `Dobla más ${fname(h.finger)}`,
  curl_less: (h) => `Estira más ${fname(h.finger)}`,
  bend_knuckle: (h) => `Dobla ${fname(h.finger)} desde el nudillo`,
  straighten_knuckle: (h) => `Endereza ${fname(h.finger)} desde el nudillo`,
  bend_tip: (h) => `Dobla la punta ${ofFinger(h.finger)}`,
  straighten_tip: (h) => `Endereza la punta ${ofFinger(h.finger)}`,
  together: (h) => `Junta ${fname(h.finger)} y ${fname(h.other)}`,
  apart: (h) => `Separa ${fname(h.finger)} y ${fname(h.other)}`,
  cross: (h) => `Cruza ${fname(h.finger)} y ${fname(h.other)}`,
  thumb_toward_palm: () => 'Lleva el pulgar hacia la palma',
  thumb_away: () => 'Separa el pulgar de la mano',
  thumb_front: () => 'Lleva el pulgar más al frente',
  thumb_back: () => 'Lleva el pulgar más atrás',
  thumb_up: () => 'Sube el pulgar',
  thumb_down: () => 'Baja el pulgar',
  thumb_touch: (h) => `Toca ${fname(h.other)} con el pulgar`,
};

/** @param {{code: string, finger?: FingerName, other?: FingerName}|null} hint */
export function hintText(hint) {
  if (!hint) return '';
  const fn = HINTS[hint.code];
  return fn ? fn(hint) : 'Revisa la forma de tu mano';
}

/** Plain names for the research source keys (docs/research/lsm-alfabeto.md, section 1). */
/** @type {Record<string, string>} */
export const SOURCE_NAMES = {
  DAK: 'la lámina Daktilos del CICESE',
  CIC: 'el sitio de I. H. López-Nava (CICESE)',
  CRUZ: 'la gramática de la LSM de Miroslava Cruz Aldrete',
  UAQ: 'la tabla de parámetros de la UAQ',
  UAEH: 'el artículo de la UAEH',
  BUAP: 'el artículo de la BUAP',
  MAN: 'las fotos del proyecto Manus',
  PDI: 'las fotos del repositorio pdi-python',
  AME: 'las tarjetas del memorama AME',
  ROB: 'las fotos de un proyecto estudiantil',
  LIFE: 'Lifeprint, de W. Vicars',
};

/** @param {string[]} items */
export function listJoin(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

export const S = {
  appName: 'Deletrea',
  skipToContent: 'Saltar al contenido',
  homeLink: 'Deletrea, ir al inicio',
  nav: {
    label: 'Secciones',
    practice: 'Practicar',
    alphabet: 'Alfabeto',
    spell: 'Deletrear',
    about: 'Acerca',
  },
  titles: {
    home: 'Deletrea: practica el alfabeto manual de la LSM',
    alphabet: 'Alfabeto · Deletrea',
    letter: (/** @type {string} */ l) => `Letra ${l} · Deletrea`,
    practice: 'Práctica · Deletrea',
    spell: 'Deletrear · Deletrea',
    about: 'Acerca · Deletrea',
    notFound: 'Página no encontrada · Deletrea',
  },

  validation: {
    text: 'Estas señas aún no han sido revisadas por personas Sordas usuarias de LSM. Pueden tener errores.',
    status: (/** @type {string} */ s) => `Estado: ${s}.`,
    link: 'Cómo ayudar',
  },

  home: {
    h1: 'Practica el alfabeto manual de la Lengua de Señas Mexicana',
    lead: 'Ves la letra dibujada, la haces frente a la cámara y Deletrea te dice qué dedo corregir.',
    handLabel: (/** @type {string} */ letter) => `Mano dibujada deletreando HOLA. Letra actual: ${letter}.`,
    spelling: 'Deletreando',
    word: 'HOLA',
    start: 'Practicar con mi cámara',
    seeAlphabet: 'Ver el alfabeto',
    spellWord: 'Deletrear una palabra',
    privacy: 'El video no sale de tu teléfono. No hay servidor que lo reciba.',
  },

  alphabet: {
    h1: 'Alfabeto',
    lead: 'Son 27 letras. 21 se hacen con la mano quieta y 6 llevan movimiento. Toca una para verla de cerca.',
    mirror: 'Las manos se ven como en un espejo.',
    moving: 'con movimiento',
    cellLabel: (/** @type {string} */ l, /** @type {boolean} */ moving) => `Letra ${l}${moving ? ', con movimiento' : ''}`,
  },

  letter: {
    srPrefix: 'Letra ',
    handLabel: (/** @type {string} */ l, /** @type {string} */ d) => `Mano haciendo la letra ${l}. ${d}`,
    rotateHelp: 'Arrastra la mano o usa las flechas del teclado para girarla.',
    resetView: 'Ver de frente',
    howTo: 'Cómo se hace',
    movement: 'Movimiento',
    movingNote: 'Esta letra lleva movimiento. Deletrea la muestra, pero todavía no la reconoce.',
    mirror: 'Ves la mano como en un espejo: haz la seña tal como la ves. Si usas la mano izquierda, también se reconoce.',
    evidence: 'De dónde sale',
    confidence: {
      alta: 'Las fuentes consultadas coinciden en esta forma.',
      media: 'Las fuentes coinciden solo en parte. Tómala con cuidado.',
      baja: 'Hay poca evidencia para esta forma.',
    },
    sources: (/** @type {string} */ list) => `Se basa en ${list}.`,
    double: {
      l: 'Algunas fuentes describen la LL como esta misma forma de mano deslizándose hacia un lado. Todavía no está confirmado.',
      r: 'Algunas fuentes describen la RR como esta misma forma de mano deslizándose hacia un lado. Todavía no está confirmado.',
    },
    confusable: (/** @type {string} */ list) => `Por ahora Deletrea no distingue bien esta letra de ${list}.`,
    practice: 'Practicar esta letra',
    prev: 'Anterior',
    next: 'Siguiente',
    prevLabel: (/** @type {string} */ l) => `Letra anterior: ${l}`,
    nextLabel: (/** @type {string} */ l) => `Letra siguiente: ${l}`,
  },

  practice: {
    h1: 'Práctica',
    letters: (/** @type {string} */ list) => `Vas a practicar: ${list}.`,
    intro: {
      title: 'Antes de empezar',
      why: 'Deletrea usa la cámara para ver tu mano y decirte qué corregir.',
      privacy: 'El video se procesa en este dispositivo y no se envía a ningún lado.',
      download: 'Al activar la cámara se descarga el programa que reconoce manos. La primera vez puede tardar un poco.',
      start: 'Activar cámara',
      demo: 'Probar sin cámara',
      demoHelp: 'Sin cámara, una mano simulada hace las letras para que veas cómo funciona.',
    },
    requesting: {
      title: 'Esperando permiso para usar la cámara…',
      body: 'Tu navegador te va a preguntar. Elige Permitir.',
    },
    loading: {
      title: 'Preparando el reconocimiento de manos…',
      body: 'La primera vez puede tardar un poco, según tu conexión.',
    },
    stageLabel: 'Tu mano, vista como en un espejo',
    mirror: 'Vista de espejo',
    synthetic: 'Mano simulada, sin cámara',
    target: 'Haz la letra',
    targetHandLabel: (/** @type {string} */ l) => `Así se hace la letra ${l}`,
    howTo: 'Ver cómo se hace',
    progress: (/** @type {number} */ i, /** @type {number} */ n) => `Letra ${i} de ${n}`,
    noHand: 'Muestra tu mano a la cámara',
    hold: 'Así. Mantén la seña.',
    skip: 'Saltar',
    finish: 'Terminar',
    hideVideo: 'Ocultar video',
    success: (/** @type {string} */ l) => `Esa es la ${l}`,
    nextLetter: 'Siguiente letra',
    seeSummary: 'Ver resumen',
    observe: {
      title: (/** @type {string} */ l) => `La ${l} lleva movimiento`,
      body: 'Deletrea todavía no reconoce letras con movimiento. Mírala, hazla y continúa.',
      cont: 'Continuar',
    },
    finished: {
      title: 'Terminaste',
      done: 'Hiciste',
      skipped: 'Saltaste',
      observed: 'Solo viste',
      none: 'Ninguna',
      again: 'Practicar otra vez',
      alphabet: 'Ver el alfabeto',
    },
    errors: {
      denied: {
        title: 'No hay permiso para usar la cámara',
        body: 'Para darlo, toca el ícono junto a la dirección del sitio, busca Cámara y elige Permitir. Luego toca Reintentar.',
      },
      'no-camera': {
        title: 'No se encontró una cámara disponible',
        body: 'Revisa que tu equipo tenga cámara y que ninguna otra app la esté usando.',
      },
      unsupported: {
        title: 'Este navegador no permite usar la cámara aquí',
        body: 'La cámara necesita una conexión segura (https) y un navegador reciente, como Chrome, Firefox o Safari.',
      },
      'load-error': {
        title: 'No se pudo cargar el reconocimiento de manos',
        body: 'Puede ser la conexión o un bloqueo del navegador. Revisa tu internet y vuelve a intentar.',
      },
    },
    retry: 'Reintentar',
    details: 'Detalles técnicos',
    blocked: 'Direcciones bloqueadas por la política de seguridad:',
    noDetails: 'Sin más información.',
    debug: {
      title: 'Depuración',
      hand: 'etiqueta del rastreador',
      side: 'lado usado',
      sideByShape: 'por la forma',
      sideBest: 'el mejor de los dos',
      orientation: 'orientación',
      none: 'sin mano',
    },
  },

  spell: {
    h1: 'Deletrear',
    lead: 'Escribe una palabra y practica sus letras una por una.',
    label: 'Escribe una palabra o tu nombre',
    help: 'Los acentos se quitan; la ñ se queda.',
    previewLabel: 'Letras',
    empty: 'Escribe algo para ver sus letras.',
    skipped: (/** @type {string} */ list) => `Sin seña en el alfabeto, se omiten: ${list}`,
    moving: 'Las letras con movimiento se muestran, pero no se califican.',
    go: 'Practicar',
    needLetters: 'Escribe al menos una letra del alfabeto.',
  },

  about: {
    h1: 'Acerca de Deletrea',
    what: {
      title: 'Qué es y qué no es',
      p1: 'Deletrea es una herramienta para practicar el alfabeto manual de la Lengua de Señas Mexicana (LSM) con la cámara. Muestra cada letra como una mano dibujada y te dice qué dedo ajustar.',
      p2: 'El alfabeto es una parte pequeña de la LSM. Las personas Sordas señantes deletrean poco: lo usan sobre todo para nombres de personas y lugares que no tienen seña propia, o para presentar una seña nueva. Saber el abecedario no es saber LSM.',
    },
    language: {
      title: 'La LSM es una lengua',
      p1: 'La Ley General para la Inclusión de las Personas con Discapacidad (2011) reconoce a la LSM como lengua nacional. El primer reconocimiento federal fue el 10 de junio de 2005; por eso ese día es el Día Nacional de la LSM.',
      p2: 'La LSM no viene de la lengua de señas americana (ASL). Pertenece a la familia de la lengua de señas francesa. Por eso Deletrea no usa formas de la ASL.',
      p3: 'Se escribe «Sordo» con mayúscula cuando se habla de identidad cultural y lingüística, y «sordo» con minúscula para la condición auditiva.',
      p4: 'No existe una cifra oficial de cuántas personas usan la LSM.',
    },
    privacy: {
      title: 'Tu privacidad',
      p1: 'El video de tu cámara se procesa en tu dispositivo. Deletrea no tiene servidor y no guarda ni envía imágenes.',
      p2: 'La página trae una política de seguridad de contenido (CSP) que el navegador hace cumplir: solo puede conectarse a este sitio, a cdn.jsdelivr.net (la biblioteca MediaPipe) y a storage.googleapis.com (el modelo de manos). Esas dos conexiones ocurren solo cuando activas la cámara.',
      p3: 'MediaPipe está fijado en la versión 0.10.33, que no trae aviso de envío de métricas de uso.',
    },
    validation: {
      title: 'Estado de las señas',
      p1: 'Las formas de mano salen de fuentes publicadas (tesis, láminas y bases de datos abiertas), no de una revisión con personas Sordas. Pueden tener errores.',
      limits: [
        'Las señas aún no han sido validadas por personas Sordas usuarias de LSM.',
        'Los umbrales de reconocimiento se ajustaron con una mano simulada, no con grabaciones de manos reales.',
        'Las letras con movimiento se muestran, pero no se reconocen.',
        'Una mano abierta y relajada, con los dedos un poco separados, puede pasar como B.',
        'Una mano plana que muestra el dorso a la cámara, hecha con la otra mano, también puede pasar como B.',
        'El reconocimiento de manos se descarga de internet la primera vez que usas la cámara.',
      ],
      help: 'Si usas la LSM y ves un error, nos ayuda mucho que lo digas.',
      link: 'Cómo ayudar a validar las señas',
    },
    credits: {
      title: 'Créditos y licencias',
      items: [
        'Código: licencia MIT.',
        'Tipografía: Atkinson Hyperlegible Next, licencia SIL Open Font License.',
        'Seguimiento de manos: MediaPipe, de Google, licencia Apache 2.0.',
        'Formas de las letras: investigación documentada en el repositorio, con sus fuentes y su nivel de confianza.',
      ],
    },
  },

  notFound: {
    h1: 'Esta página no existe',
    body: 'Puede que el enlace esté mal escrito.',
    home: 'Volver al inicio',
  },
};

export const VALIDATION_URL = 'https://github.com/MathewLG/deletrea/blob/main/docs/VALIDATION.md';
