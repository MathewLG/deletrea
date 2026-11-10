# Validación del alfabeto

Este documento es para personas Sordas usuarias de la Lengua de Señas Mexicana (LSM) e intérpretes certificados. Gracias por leerlo. Sabemos que quien debe decir si una seña está bien es quien la usa todos los días, y no quien programó esta aplicación.

## Qué hay que saber

Deletrea muestra el alfabeto manual de la LSM como manos dibujadas. Esas formas salen de fuentes publicadas (tesis, láminas y bases de datos abiertas) y de su comparación, no de una revisión hecha por personas Sordas. Por eso **el alfabeto que muestra la aplicación no está validado**. Puede tener errores de forma de la mano, de orientación o de movimiento, y no queremos enseñar una seña equivocada.

La investigación detrás de cada letra, con sus fuentes y su nivel de confianza, está en [`research/lsm-alfabeto.md`](research/lsm-alfabeto.md).

## Letras con dudas

La investigación marca estas letras como inciertas (sección 4 del documento anterior):

- **K**: las fuentes no coinciden en el sentido del giro de la muñeca, ni en la posición inicial, ni en si es un movimiento único o un vaivén.
- **P**: hay duda sobre la orientación (índice arriba y medio al frente, o mano horizontal).
- **Q**: no coinciden la forma del índice (recto, curvo o en gancho) ni el tipo de movimiento.
- **X**: no está claro si el movimiento es único o repetido, ni dónde queda el pulgar.
- **Y**: hay duda sobre hacia dónde mira la palma, aunque la forma (pulgar y meñique extendidos) no se discute.
- **LL** y **RR**: las fuentes las describen como letras dobles con desplazamiento de la mano, pero casi ninguna las dibuja por separado.

Las demás letras también necesitan revisión. Estas son las que más.

## Cómo revisar

1. Abre la aplicación y entra a **Alfabeto**.
2. Abre la pantalla de cada letra y compara la mano dibujada y su descripción con la seña que tú conoces.
3. Si algo está mal o incompleto, abre un *issue* en GitHub, **uno por letra**. Indica en el título la letra.
4. En el *issue* di qué está mal: la forma de la mano, la orientación, el movimiento o la descripción escrita. Si puedes, agrega una foto, un dibujo o una referencia a una fuente publicada.
5. Si la letra está bien, también nos sirve saberlo: abre el *issue* y dilo.

No hace falta saber programar. Si prefieres otra forma de contacto, puedes decirlo en el *issue*.

## Cómo se registrará una letra validada

Cuando una persona Sorda usuaria de LSM o un intérprete certificado confirme una letra, se registrará en este repositorio con:

- el nombre o el rol de quien la validó, solo si da su consentimiento (si no, se anotará únicamente que fue validada por una persona Sorda o por un intérprete certificado);
- la fecha de la validación;
- los cambios que se hicieron a la letra, si los hubo.

Hasta que una letra tenga ese registro, la aplicación seguirá avisando que el alfabeto no está validado.

## Regla del proyecto

Las formas de la mano cambian solo con una fuente citada o con la revisión de una persona que valide. Nadie de este proyecto las modificará por intuición.
