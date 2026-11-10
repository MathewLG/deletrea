// @ts-check
import { ORIENT, closed, finger, straightTogether, thumb } from './poses.js';

/** @typedef {import('../core/handModel.js').HandPose} HandPose */
/** @typedef {import('../core/handModel.js').Orientation} Orientation */
/** @typedef {import('../core/handModel.js').FingerName} FingerName */
/**
 * @typedef {Object} Sign
 * @property {string} id                 'a' … 'z', 'ñ' stored as 'enie'
 * @property {string} letter             'A' … 'Ñ'
 * @property {'static'|'dynamic'} kind
 * @property {HandPose} pose             for dynamic letters, the starting handshape
 * @property {Orientation} orientation
 * @property {boolean} [looseOrientation]
 * @property {Partial<Record<FingerName|'orientation', number>>} [tolerance]
 * @property {string} description        Spanish, one or two sentences, how to form it
 * @property {string} [movement]         Spanish, dynamic letters only
 * @property {'alta'|'media'|'baja'} confidence   from the research table
 * @property {string} [confidenceNote]   Spanish, replaces the generic confidence sentence when the rating needs explaining
 * @property {string[]} sources          keys from the research file, e.g. ['DAK','CRUZ']
 * @property {string[]} [confusable]     ids this engine cannot reliably tell apart from this one
 */

export const VALIDATION_STATUS = 'sin validar';

const FIST = { index: closed(), middle: closed(), ring: closed(), pinky: closed() };
const COMMON = ['DAK', 'MAN', 'PDI', 'ROB', 'UAQ', 'CRUZ'];

// Thumb angles were solved numerically for a target tip position or fingertip contact, then checked by eye
// against the research images with scripts/render-poses.mjs.

/** @type {Sign[]} */
export const ALPHABET = [
  {
    id: 'a',
    letter: 'A',
    kind: 'static',
    pose: { thumb: thumb(50, 15, 5, 5, 0), ...FIST },
    orientation: ORIENT.front,
    tolerance: { thumb: 1.5 },
    description: 'Cierra la mano en puño y deja el pulgar estirado hacia un lado, separado de los dedos. La palma mira al frente.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'PDI', 'AME', 'ROB', 'UAQ', 'CRUZ'],
  },
  {
    id: 'b',
    letter: 'B',
    kind: 'static',
    pose: {
      thumb: thumb(18, 1, 76, 81, 9),
      index: straightTogether('index'),
      middle: straightTogether('middle'),
      ring: straightTogether('ring'),
      pinky: straightTogether('pinky'),
    },
    orientation: ORIENT.front,
    description: 'Estira los cuatro dedos juntos hacia arriba y dobla el pulgar sobre la palma. La palma mira al frente.',
    confidence: 'alta',
    sources: COMMON,
  },
  {
    id: 'c',
    letter: 'C',
    kind: 'static',
    pose: {
      thumb: thumb(50, 13, 73, 44, 35),
      index: finger(35, 50, 30, -2),
      middle: finger(35, 50, 30, 0),
      ring: finger(35, 50, 30, 2),
      pinky: finger(35, 50, 30, 4),
    },
    orientation: ORIENT.diagonal,
    description:
      'Curva los cuatro dedos juntos y pon el pulgar curvado enfrente, como si sostuvieras un vaso, sin que se toquen. Gira la palma de lado para que la C se vea de perfil.',
    confidence: 'alta',
    sources: COMMON,
  },
  {
    id: 'd',
    letter: 'D',
    kind: 'static',
    pose: {
      thumb: thumb(-3, 41, -3, 70, 14),
      index: finger(0, 0, 0, 0),
      middle: finger(60, 80, 35, 4),
      ring: finger(60, 80, 35, 9),
      pinky: finger(60, 80, 35, 14),
    },
    orientation: ORIENT.front,
    description:
      'Estira el índice hacia arriba y curva el medio, el anular y el meñique hasta apoyar sus yemas en el pulgar. La palma mira al frente.',
    confidence: 'alta',
    sources: COMMON,
  },
  {
    id: 'e',
    letter: 'E',
    kind: 'static',
    pose: {
      thumb: thumb(20, -2, 67, 55, 16),
      index: finger(10, 95, 75, -2),
      middle: finger(10, 95, 75, 0),
      ring: finger(10, 95, 75, 2),
      pinky: finger(10, 95, 75, 4),
    },
    orientation: ORIENT.front,
    tolerance: { thumb: 1.5 },
    description:
      'Dobla los cuatro dedos juntos en gancho, con las yemas hacia la parte alta de la palma, y deja el pulgar doblado sobre la palma por debajo de ellas. La palma mira al frente.',
    confidence: 'alta',
    sources: COMMON,
  },
  {
    id: 'f',
    letter: 'F',
    kind: 'static',
    pose: {
      thumb: thumb(34, 40, 21, 55, -23),
      index: finger(45, 80, 45, 0),
      middle: straightTogether('middle'),
      ring: straightTogether('ring'),
      pinky: straightTogether('pinky'),
    },
    orientation: ORIENT.front,
    description:
      'Dobla el índice sobre el pulgar hasta que se toquen y estira juntos el medio, el anular y el meñique. La palma mira al frente.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'PDI', 'ROB', 'AME', 'CRUZ'],
  },
  {
    id: 'g',
    letter: 'G',
    kind: 'static',
    pose: { thumb: thumb(72, 10, 5, 5, 0), ...FIST, index: finger(0, 0, 0, 0) },
    orientation: ORIENT.backSideways,
    description:
      'Estira el índice hacia el centro de tu cuerpo y el pulgar hacia arriba, con los demás dedos cerrados. Quien te mira ve el dorso de tu mano.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'PDI', 'UAQ', 'CRUZ', 'ROB'],
  },
  {
    id: 'h',
    letter: 'H',
    kind: 'static',
    pose: { thumb: thumb(72, 10, 5, 5, 0), ...FIST, index: straightTogether('index'), middle: straightTogether('middle') },
    orientation: ORIENT.backSideways,
    description:
      'Como la G, pero con el índice y el medio estirados y juntos. El pulgar apunta hacia arriba y quien te mira ve el dorso de tu mano.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'PDI', 'UAQ', 'CRUZ', 'ROB'],
  },
  {
    id: 'i',
    letter: 'I',
    kind: 'static',
    pose: { thumb: thumb(-2, 44, 25, 33, -32), ...FIST, pinky: finger(0, 0, 0, -4) },
    orientation: ORIENT.front,
    description: 'Cierra la mano en puño con el pulgar sobre los dedos y levanta solo el meñique. La palma mira al frente.',
    confidence: 'alta',
    sources: COMMON,
  },
  {
    id: 'j',
    letter: 'J',
    kind: 'dynamic',
    pose: { thumb: thumb(-2, 44, 25, 33, -32), ...FIST, pinky: finger(0, 0, 0, -4) },
    orientation: ORIENT.front,
    description: 'Empieza con la forma de la I: puño con el pulgar sobre los dedos y el meñique levantado.',
    movement:
      'Con la punta del meñique dibuja una J en el aire: baja y luego curva hacia el centro de tu cuerpo. Una de las fuentes indica que al terminar la palma queda mirando hacia adentro.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'UAQ', 'AME', 'CIC'],
  },
  {
    id: 'k',
    letter: 'K',
    kind: 'dynamic',
    pose: {
      thumb: thumb(16, -10, 32, 57, 46),
      ...FIST,
      index: finger(0, 0, 0, 0),
      middle: finger(90, 0, 0, 0),
    },
    orientation: ORIENT.sideways,
    description:
      'Empieza con la forma de la P: el índice arriba, el medio doblado en el nudillo hacia el frente y el pulgar tocando el medio entre los dos.',
    movement:
      'Gira la muñeca más o menos un cuarto de vuelta. Las fuentes no coinciden en la dirección del giro ni en la postura inicial, así que tómalo como una guía aproximada.',
    confidence: 'media',
    sources: ['DAK', 'MAN', 'PDI', 'UAQ', 'AME', 'ROB'],
  },
  {
    id: 'l',
    letter: 'L',
    kind: 'static',
    pose: { thumb: thumb(55, 8, 5, 5, 0), ...FIST, index: finger(0, 0, 0, 0) },
    orientation: ORIENT.front,
    description:
      'Estira el índice hacia arriba y el pulgar hacia el lado, como una L, con los demás dedos cerrados. La palma mira al frente.',
    confidence: 'alta',
    sources: COMMON,
  },
  {
    id: 'm',
    letter: 'M',
    kind: 'static',
    pose: {
      thumb: thumb(18, 1, 76, 81, 9),
      index: straightTogether('index'),
      middle: straightTogether('middle'),
      ring: straightTogether('ring'),
      pinky: closed(),
    },
    orientation: ORIENT.backDown,
    tolerance: { index: 1.4, middle: 1.4, ring: 1.4, orientation: 1.2 },
    description:
      'Deja colgar juntos el índice, el medio y el anular, con el meñique cerrado. Quien te mira ve el dorso de tu mano. El pulgar no se ve en ninguna fuente, así que no sabemos con certeza dónde va.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'PDI', 'ROB', 'AME', 'UAQ', 'CRUZ'],
  },
  {
    id: 'n',
    letter: 'N',
    kind: 'static',
    pose: {
      thumb: thumb(18, 1, 76, 81, 9),
      index: straightTogether('index'),
      middle: straightTogether('middle'),
      ring: closed(),
      pinky: closed(),
    },
    orientation: ORIENT.backDown,
    tolerance: { index: 1.4, middle: 1.4, orientation: 1.2 },
    description:
      'Deja colgar juntos el índice y el medio, con el anular y el meñique cerrados. Quien te mira ve el dorso de tu mano. El pulgar no se ve en ninguna fuente, así que no sabemos con certeza dónde va.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'PDI', 'ROB', 'AME', 'UAQ', 'CRUZ', 'LIFE'],
  },
  {
    id: 'enie',
    letter: 'Ñ',
    kind: 'dynamic',
    pose: {
      thumb: thumb(18, 1, 76, 81, 9),
      index: straightTogether('index'),
      middle: straightTogether('middle'),
      ring: closed(),
      pinky: closed(),
    },
    orientation: ORIENT.backDown,
    description:
      'Empieza con la forma de la N: el índice y el medio colgando juntos y el dorso hacia quien te mira. Como en la N, el pulgar no se ve en ninguna fuente.',
    movement: 'Mueve la muñeca de un lado a otro para que las puntas de los dedos se balanceen.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'UAQ', 'AME', 'LIFE'],
  },
  {
    id: 'o',
    letter: 'O',
    kind: 'static',
    pose: {
      thumb: thumb(26, 43, 34, 8, -29),
      index: finger(45, 65, 35, -4),
      middle: finger(45, 65, 35, 4),
      ring: finger(45, 65, 35, 10),
      pinky: finger(45, 65, 35, 16),
    },
    orientation: ORIENT.diagonal,
    description:
      'Curva todos los dedos hasta que sus yemas se junten con la del pulgar, formando un círculo. Gira la palma de lado para que el hueco se vea de frente.',
    confidence: 'alta',
    sources: COMMON,
  },
  {
    id: 'p',
    letter: 'P',
    kind: 'static',
    pose: {
      thumb: thumb(16, -10, 32, 57, 46),
      ...FIST,
      index: finger(0, 0, 0, 0),
      middle: finger(90, 0, 0, 0),
    },
    orientation: ORIENT.sideways,
    looseOrientation: true,
    description:
      'Estira el índice hacia arriba y dobla el medio en el nudillo para que apunte al frente, con el pulgar tocándolo entre los dos. El anular y el meñique quedan cerrados y la palma mira de lado.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'PDI', 'AME', 'CRUZ', 'UAQ'],
  },
  {
    id: 'q',
    letter: 'Q',
    kind: 'dynamic',
    pose: { thumb: thumb(35, 30, 10, 0, 0), ...FIST, index: finger(15, 35, 20, 0) },
    orientation: ORIENT.backDown,
    looseOrientation: true,
    description:
      'Deja colgar la mano desde la muñeca con el índice y el pulgar apuntando hacia abajo, paralelos y sin tocarse. Los demás dedos quedan cerrados. Las fuentes no dicen con claridad hacia dónde mira la palma, y no coinciden en si el índice va recto o en gancho.',
    movement:
      'Mueve la mano desde la muñeca. Las fuentes no coinciden en el movimiento: unas dibujan un vaivén y otra describe un cuarto de giro hacia abajo.',
    confidence: 'media',
    sources: ['DAK', 'MAN', 'AME', 'UAQ', 'CRUZ', 'ROB'],
  },
  {
    id: 'r',
    letter: 'R',
    kind: 'static',
    pose: {
      thumb: thumb(-7, 17, 37, 9, 39),
      ...FIST,
      index: finger(0, 0, 0, -8),
      middle: finger(10, 5, 0, 16),
    },
    orientation: ORIENT.front,
    description:
      'Estira el índice y el medio y cruza el medio sobre el índice. El pulgar sujeta el anular y el meñique cerrados, y la palma mira al frente.',
    confidence: 'alta',
    sources: COMMON,
    confusable: ['u'],
  },
  {
    id: 's',
    letter: 'S',
    kind: 'static',
    pose: { thumb: thumb(25, 50, 59, 25, -25), ...FIST },
    orientation: ORIENT.front,
    description: 'Cierra la mano en puño con el pulgar cruzado por delante de los dedos. La palma mira al frente.',
    confidence: 'alta',
    sources: COMMON,
    confusable: ['t'],
  },
  {
    id: 't',
    letter: 'T',
    kind: 'static',
    pose: { thumb: thumb(-10, 19, -15, 13, -30), ...FIST, index: finger(70, 90, 50, 0) },
    orientation: ORIENT.front,
    description:
      'Cierra la mano en puño y mete el pulgar entre el índice y el medio, con la punta asomando. La palma mira al frente.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'PDI', 'ROB', 'AME', 'UAQ', 'CRUZ'],
    confusable: ['s'],
  },
  {
    id: 'u',
    letter: 'U',
    kind: 'static',
    pose: { thumb: thumb(-7, 17, 37, 9, 39), ...FIST, index: straightTogether('index'), middle: straightTogether('middle') },
    orientation: ORIENT.front,
    description:
      'Estira juntos el índice y el medio hacia arriba. El pulgar sujeta el anular y el meñique cerrados, y la palma mira al frente.',
    confidence: 'alta',
    sources: COMMON,
    confusable: ['r'],
  },
  {
    id: 'v',
    letter: 'V',
    kind: 'static',
    pose: { thumb: thumb(-7, 17, 37, 9, 39), ...FIST, index: finger(0, 0, 0, 15), middle: finger(0, 0, 0, -12) },
    orientation: ORIENT.front,
    description:
      'Estira el índice y el medio separados en forma de V. El pulgar sujeta el anular y el meñique cerrados, y la palma mira al frente.',
    confidence: 'alta',
    sources: COMMON,
  },
  {
    id: 'w',
    letter: 'W',
    kind: 'static',
    pose: {
      thumb: thumb(-6, 46, 93, -6, -26),
      index: finger(0, 0, 0, 12),
      middle: finger(0, 0, 0, 0),
      ring: finger(0, 0, 0, -12),
      pinky: closed(),
    },
    orientation: ORIENT.front,
    description:
      'Estira el índice, el medio y el anular separados, y sujeta el meñique doblado con el pulgar. La palma mira al frente.',
    confidence: 'alta',
    sources: COMMON,
  },
  {
    id: 'x',
    letter: 'X',
    kind: 'dynamic',
    pose: { thumb: thumb(30, 25, 10, 10, 0), ...FIST, index: finger(30, 90, 60, 0) },
    // Horizontal, palm sideways toward the body midline, knuckles toward the viewer (research table, X).
    orientation: { palmar: { x: 1, y: 0, z: 0 }, distal: { x: 0, y: 0, z: 1 } },
    looseOrientation: true,
    description:
      'Cierra la mano en puño con el índice doblado en gancho. Ponla horizontal y de lado, con la palma hacia el centro de tu cuerpo y los nudillos hacia el frente.',
    movement:
      'Mueve la mano en línea recta desde enfrente hacia ti. No está claro si es un solo movimiento o un vaivén, ni dónde va exactamente el pulgar.',
    confidence: 'media',
    sources: ['DAK', 'MAN', 'UAQ', 'AME', 'ROB'],
  },
  {
    id: 'y',
    letter: 'Y',
    kind: 'static',
    pose: { thumb: thumb(80, 0, 5, 5, 0), ...FIST, pinky: finger(0, 0, 0, -15) },
    orientation: ORIENT.backSideways,
    looseOrientation: true,
    description:
      'Estira el pulgar y el meñique en direcciones opuestas y cierra los demás dedos. Pon la mano de lado, con el pulgar arriba y el dorso hacia quien te mira.',
    confidence: 'media',
    confidenceNote:
      'Las fuentes coinciden en la forma de la mano, pero no en hacia dónde mira: la mayoría muestra el dorso y dos muestran la palma al frente. Tómala con cuidado.',
    sources: ['DAK', 'MAN', 'PDI', 'UAQ', 'CRUZ', 'ROB'],
  },
  {
    id: 'z',
    letter: 'Z',
    kind: 'dynamic',
    pose: { thumb: thumb(-2, 44, 25, 33, -32), ...FIST, index: finger(0, 0, 0, 0) },
    orientation: ORIENT.front,
    description: 'Estira el índice hacia arriba con los demás dedos cerrados y el pulgar sobre ellos.',
    movement: 'Con la punta del índice dibuja una Z en el aire, como si escribieras en una pizarra frente a ti.',
    confidence: 'alta',
    sources: ['DAK', 'MAN', 'UAQ', 'CRUZ', 'AME'],
  },
];

export const STATIC_IDS = ALPHABET.filter((s) => s.kind === 'static').map((s) => s.id);

const BY_ID = new Map(ALPHABET.map((s) => [s.id, s]));

/** @param {string} id @returns {Sign|undefined} */
export function getSign(id) {
  return BY_ID.get(id);
}

/**
 * @param {string} text
 * @returns {{char: string, sign: Sign|null}[]}
 */
export function wordToSigns(text) {
  /** @type {{char: string, sign: Sign|null}[]} */
  const out = [];
  for (const raw of String(text).normalize('NFC').toLowerCase()) {
    // Ñ is a letter of its own, so it is protected before accents are stripped.
    const char = raw === 'ñ' ? 'ñ' : raw.normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!char || !/\p{L}/u.test(char)) continue;
    const id = char === 'ñ' ? 'enie' : char;
    out.push({ char, sign: BY_ID.get(id) ?? null });
  }
  return out;
}
