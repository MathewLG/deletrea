# Alfabeto manual de la Lengua de Señas Mexicana (LSM): configuraciones por letra

Investigación para la app de práctica del alfabeto manual. Fecha de consulta: 2026-11-09.

## Advertencias antes de usar este documento

1. **No pude abrir los diccionarios institucionales principales.** «Manos con Voz» (CONAPRED), el DIELSEME (SEP), el apéndice de dactilología del diccionario del INDEPEDI y el material de CONADIS quedaron fuera de alcance desde este entorno (ver «Fuentes no accesibles»). La tabla se apoya en una lámina del CICESE, una tesis doctoral de lingüística de la LSM, una tabla de parámetros publicada con un artículo de la UAQ y cuatro conjuntos de imágenes obtenidos de GitHub.
2. **Ninguna fuente de imágenes declara que sus señantes sean personas Sordas o usuarias de LSM.** Un artículo (Ordaz-Hernández et al., 2023) dice expresamente que sus participantes no tenían experiencia previa con la LSM.
3. **Recomendación:** antes de publicar, pedir a una persona Sorda usuaria de LSM o a un intérprete certificado que revise la tabla, sobre todo K, P, Q, X, Y, LL y RR.
4. No se rellenó ningún hueco con suposiciones ni con la forma de ASL. Donde falta evidencia, se dice.
5. Todas las imágenes muestran la mano derecha como dominante. Para personas zurdas se asume imagen en espejo; ninguna fuente consultada lo trata.

Convención de orientación usada aquí: «hacia el frente» = la palma mira hacia fuera, lejos de quien seña; «hacia el signante» = la palma mira a quien seña y quien observa ve el dorso; «hacia adentro» = hacia la línea media del cuerpo (lado no dominante).

---

## 1. Fuentes

### 1.1 Fuentes leídas o vistas

Las claves entre corchetes se usan en la tabla por letra.

| clave | fuente | qué aportó |
|---|---|---|
| [DAK] | «Alfabeto de la Lengua de Señas Mexicana», hoja del proyecto Daktilos, CICESE (Laboratorio de Ciencia de Datos y Aprendizaje Automático), 2025. https://github.com/husseinlopez/daktilos (archivo `hoja-daktilos-2025.pdf`, commit 3f3918a). Plataforma: https://daktilos.cicese.mx/ | **Lámina vista**: dibujos de 27 letras (A–Z y Ñ) con flechas en J, K, Ñ, Q, X, Z y un recuadro «Letra doble». Dos notas de texto: «Las señas se muestran como si te vieras frente a un espejo» y «Excepto la X, el movimiento es de enfrente hacia atrás». |
| [CIC] | I. H. López-Nava, «Aprende el alfabeto de la LSM de manera interactiva». https://sites.google.com/view/husseinlopeznava/lsm | Texto: 21 señas estáticas; J, K, Ñ, Q, X, Z son dinámicas. |
| [CIC-Z] | J. A. Navarrete-López e I. H. López-Nava, «Mexican Sign Language Alphabet (dynamic signs only)», Zenodo, 2025. https://zenodo.org/records/14689869 | Solo la ficha (no se descargó, 3.6 GB): videos de J, K, Ñ, Q, X, Z; 20 participantes; complementa un conjunto estático (DOI 10.5281/zenodo.10067509). No indica si los participantes usan LSM. |
| [CIC-26] | J. J. Gortarez-Pelayo, J. A. Navarrete-López, I. H. López-Nava, «Enhancing Keypoint Selection for Hand Model in Recognition of Mexican Sign Language Alphabet», *Computación y Sistemas* 30(1), 2026. https://cys.cic.ipn.mx/index.php/CyS/article/download/6318/4200 | Texto: 27 configuraciones; usa 21 estáticas y excluye J, K, Ñ, Q, X, Z. No describe formas. |
| [CRUZ] | Miroslava Cruz Aldrete, *Gramática de la Lengua de Señas Mexicana*, tesis doctoral, El Colegio de México, 2008 (publicada en ELiES vol. 28, 2009). Capítulos 2, 4 y 5: https://ddd.uab.cat/pub/elies/elies_a2009v28/Capitulo_4_Tesis.pdf (y `Capitulo_2_Tesis.pdf`, `Capitulo_5_Tesis.pdf`, `Portada_Tesis.pdf`, `Indice_Tesis.pdf`) | **Descripción en texto** (notación fonológica, tabla 4.11 y pp. 311–324) de las configuraciones glosadas LETRA-A, B, C, D, E, F, G, H, I, L, M, N, O, P, Q, R, S, T, U, V, W, Y; movimiento en zig-zag de la Z; ejemplo de LETRA-LL con desplazamiento lateral; sección 5.4 sobre el deletreo. Leída a través de un extractor de texto: no vi las ilustraciones del anexo. |
| [UAQ] | K. Mejía-Pérez, D.-M. Córdova-Esparza, E. del-Río-Magaña, «Desarrollo de una base de datos para el reconocimiento de la lengua de señas mexicana», *Research in Computing Science* 150(6), 2021. https://www.rcs.cic.ipn.mx/2021_150_6/Desarrollo%20de%20una%20base%20de%20datos%20para%20el%20reconocimiento%20de%20la%20lengua%20de%20senas%20mexicana.pdf — Datos: https://github.com/ICKMejia/Kenneth_DatasetLSM (`Abecedario/QuerologiaBD.csv`, commit 54f7356) | Artículo: 27 letras, 21 estáticas y 6 dinámicas (sin listarlas). **Tabla CSV leída**: para cada una de las 27 letras, estática/dinámica, tipo y dirección del movimiento, orientación de la palma y de los dedos, inicial y final. No dice quién fue el señante. |
| [UAEH] | K. Ordaz-Hernández et al., «Hacia la construcción de una base de datos abierta de la LSM», *Pädi* 11 (Especial 2), 2023. https://repository.uaeh.edu.mx/revistas/index.php/icbi/article/view/10699 | Texto: 29 señas = 27 básicas + LL y RR; 21 estáticas; 6 dinámicas; LL y RR dinámicas. Participantes sin experiencia en LSM; datos aún sin validar por expertos. |
| [BUAP] | A. Gómez-Terán, B. Priego-Sánchez, D. Pinto, «Postura esquelética de la mano para representar las configuraciones dactilológicas de la LSM en un entorno virtual», *Research in Computing Science* 149(8), 2020. https://www.rcs.cic.ipn.mx/2020_149_8/Postura%20esqueletica%20de%20la%20mano%20para%20representar%20las%20configuraciones%20dactilologicas.pdf | Texto: «El alfabeto dactilológico de la LSM consta de 29 configuraciones» (27 + RR + LL). Ángulos articulares solo para A, B y E, tomados de fotos de «Manos con Voz». |
| [MDPI] | T. J. Sánchez-Vicinaiz et al., «MediaPipe Frame and Convolutional Neural Networks-Based Fingerspelling Detection in Mexican Sign Language», *Technologies* 12(8):124, 2024. https://mdpi.com/2227-7080/12/8/124 | Texto: 27 señas, 21 estáticas «y el resto dinámicas»; no lista letras. Confusiones G/H, V/W, D/I, C/O. |
| [UV] | C. O. Sosa-Jiménez (con H. V. Ríos-Figueroa), «3D Mexican Sign Language Static Alphabet», Mendeley Data v2, Universidad Veracruzana, 2026. https://data.mendeley.com/datasets/sjt79hnb2f/2 | Ficha: 21 letras estáticas (A, B, C, D, E, F, G, H, I, L, M, N, O, P, R, S, T, U, V, W, Y), 15 personas, nubes de puntos Kinect. No descargado. |
| [PADI-26a] | V. Becerra-Tapia et al., «Implementación de un sistema portátil de traducción del alfabeto dactilológico mexicano en Raspberry Pi», *Pädi* 14 (Especial), 2026. https://repository.uaeh.edu.mx/revistas/index.php/icbi/article/view/15390 | Texto: prueba con «las 27 letras»; nombra como letras con movimiento solo J y Z. Participantes no expertos. |
| [PADI-26b] | C. Hurtado-Sánchez et al., «Análisis de aplicación web con visión artificial para el aprendizaje de la LSM», *Pädi* 14 (Especial), 2026. https://repository.uaeh.edu.mx/revistas/index.php/icbi/article/download/15515/13691/117454 | Texto: papel de la dactilología (cita a CONAPRED 2011); solo trabaja A–I. |
| [PDI] | Repositorio `areycihp/pdi-python` (tesis de Areyci Huerta Patiño y Yara Yescenia Rivas Sánchez). https://github.com/areycihp/pdi-python (commit b820580) | **Fotos vistas**: 21 letras estáticas, 5 manos distintas por letra sobre fondo negro (`Images/KBImages/`), más fotos de K (`Images/Others/`). No indica si quienes posan usan LSM. |
| [MAN] | Repositorio `25050032-commits/Manus` («Manus — Aprende el Abecedario LSM»). https://github.com/25050032-commits/Manus (commit ff711c2) | **Fotos vistas**: 27 fotografías de estudio (A–Z y Ñ) con flechas rojas en J, K, Ñ, Q, X, Z. El HTML asigna cada archivo a su letra. **Procedencia no declarada**; por el aspecto parecen reproducciones de un material impreso, pero no pude confirmar cuál. |
| [AME] | Repositorio `eltitongas1907/AME-Aprende-el-Metodo-En-Se-as-` (memorama en LSM). https://github.com/eltitongas1907/AME-Aprende-el-Metodo-En-Se-as- (commit 591450f) | **Tarjetas ilustradas vistas**: 27 letras con flechas en J, K, Ñ, Q, X. Proyecto escolar; fuente de los dibujos no declarada. Peso bajo. |
| [ROB] | Repositorio `robbolla11/Mexican-Sign-Language-Alphabet-Real-Time-Detection`. https://github.com/robbolla11/Mexican-Sign-Language-Alphabet-Real-Time-Detection (commit 49646a4) | **Fotos de webcam vistas**: 26 letras (sin Ñ), un solo señante, proyecto estudiantil. Su P no coincide con ninguna otra fuente. Peso bajo. |
| [INDEPEDI] | *Diccionario de Lengua de Señas Mexicana de la Ciudad de México*, INDEPEDI, 2017 (coord. César Ernesto Escobedo Delgado; equipo académico: Mercader Flores, Pool Westgaard, Escobar Dellamary, Cruz Aldrete, Ramírez Barba). https://pdh.cdmx.gob.mx/storage/app/media/banner/Dic_LSM%202.pdf | Texto parcial: marco legal (pp. 17–18, 29); el índice anuncia «Apéndice 3. Dactilología (Definición y Uso)», p. 467, **que no pude leer** (el extractor corta antes). Glosas con prefijo `dm-` para nombres deletreados. |
| [WIKI] | Wikipedia en español, «Lengua de señas mexicana». https://es.wikipedia.org/wiki/Lengua_de_se%C3%B1as_mexicana | Texto: 27 señas en el alfabeto manual; uso del deletreo; inicialización; art. 14 de la LGIPD. La página no mostró imagen del alfabeto. |
| [LIFE] | W. Vicars (ASL University / Lifeprint), «Mexican Sign Language», con un correo de Robin DeLaRosa (2007). https://www.lifeprint.com/asl101/topics/mexican_sign_language.htm | Única comparación explícita LSM–ASL encontrada: vocales casi iguales; N similar; Ñ = N más el trazo de la tilde. Fuente informal. |
| [TOL] | Gabriel Tolentino Tapia, *Más allá de la razón oyente: comunidad Sorda y pluralidad en la Ciudad de México*, CDH Puebla / COPRED, 2024. https://copred.cdmx.gob.mx/storage/app/media/Mas_alla_de_la_razon_oyente_digital.pdf | Texto: convención de la «S» mayúscula (p. 19, nota 1); cifras del INEGI 2020. |
| [ENTS] | Infografía «Lengua de Señas Mexicana», ENTS-UNAM / COPRED, s. f. https://www.trabajosocial.unam.mx/copred/doc/infografia_2_lengua%20de%20senas_mexicana.pdf | Texto: reconocimiento legal; no existe estadística oficial de usuarios. |
| [EFE] | Efeméride «10 de junio, Día Nacional de la LSM», documento alojado en cndh.org.mx. https://www.cndh.org.mx/sites/default/files/documentos/2025-06/FRN_JUN_10-2.pdf | Texto: reconocimiento oficial el 10 de junio de 2005; LGIPD publicada en el DOF el 30/05/2011. |
| [SEP-NEM] | SEP, Nueva Escuela Mexicana Digital, «Abecedario en Lengua de Señas Mexicana», 2026. https://nuevaescuelamexicana.sep.gob.mx/contenido/recurso/abecedario-en-lengua-de-senas-mexicana/ | Solo la descripción de la página: infografía A–Z con flechas en algunas letras. **La imagen no se pudo descargar**, así que no sustenta ninguna fila. |
| — | Manuales municipales: DIF Puebla, *Manual de LSM* (2014–2018), y SEPM Tijuana, *Mi Lengua en tu mundo*. | Sus páginas de abecedario son imágenes; el texto extraído no describe ninguna letra. Sin aporte. |
| — | README de `MonsterBlock10/CICESE-LSM_Alphabet_Recognition` (estancia en CICESE). https://github.com/MonsterBlock10/CICESE-LSM_Alphabet_Recognition | Menciona J y Z como ejemplos de letras dinámicas y los conjuntos MSL-ABC y MSL-dynamic-signs (no incluidos). |

### 1.2 Fuentes no accesibles (no sustentan nada en este documento)

| fuente | qué pasó |
|---|---|
| «Manos con Voz: Diccionario de Lengua de Señas Mexicana» (Serafín de Fleischmann y González Pérez; CONAPRED / Libre Acceso, 2011). URL citada por [PADI-26b]: https://www.conapred.org.mx/documentos_cedoc/DiccioSenas_ManosVoz_ACCSS.pdf | La herramienta de lectura no tiene permitido ese dominio. Solo sé de su contenido por los artículos que lo citan ([BUAP], [PADI-26b]). |
| DIELSEME, Diccionario Español–LSM (SEP) | Solo encontré su ficha en el catálogo de la Universidad de Hamburgo (https://www.sign-lang.uni-hamburg.de/lrec/data/dielseme.html), sin contenido. |
| PDF de diccionario alojado en educacionespecial.sep.gob.mx | La lectura falló y la descarga fue rechazada (403 del proxy). No reintenté. |
| Imagen de la infografía [SEP-NEM] (almacenamiento en blob de Azure) | Descarga rechazada (403). No reintenté. |
| Wikimedia Commons | Conexión rechazada (403). No reintenté. No vi ninguna lámina de Commons. |
| Artículo de CONADIS sobre la LSM (gob.mx) | Dominio no permitido para la herramienta de lectura. |
| Glosario Universitario de LSM (UdeG) | Bloqueado por robots.txt. |

### 1.3 Registro de imágenes vistas

Rutas relativas a `/home/claude/research/`. Los recortes y hojas de contacto generados están en `recortes/`.

| imagen | letras que sustenta |
|---|---|
| `descargas/daktilos/hoja-daktilos-2025.pdf` (recortes `recortes/fila1_*.png` … `fila4_*.png`, `dk_K.png`, `dk_Q.png`, `dk_X.png`, `dk_D.png`, `dk_EF.png`, `dk_PY.png`, `dk_ST.png`, `dk_MN.png`) | las 27 letras y la regla de «letra doble» |
| `descargas/Manus/images/IMG-20251016-WA00NN.jpg`, NN = 37 A, 39 B, 41 C, 43 D, 45 E, 47 F, 49 G, 51 H, 53 I, 55 J, 57 K, 59 L, 61 M, 63 N, 65 Ñ, 67 O, 69 P, 71 Q, 73 R, 75 S, 77 T, 79 U, 81 V, 83 W, 85 X, 87 Y, 89 Z | las 27 letras |
| `descargas/pdi-python/Images/KBImages/<LETRA>_1.jpg`, `_3.jpg`, `_4.jpg` para A, B, C, D, E, F, G, H, I, L, M, N, O, P, R, S, T, U, V, W, Y | 21 estáticas, tres manos por letra |
| `descargas/pdi-python/Images/KBImages/` `F_2`, `F_5`, `E_2`, `E_5`, `T_2`, `T_5`, `P_2`, `P_5`, `M_2` | detalle de F, E, T, P, M |
| `descargas/pdi-python/Images/Others/K_BC.jpg`, `Ky_BC.jpg` | K (mano horizontal) |
| `descargas/pdi-python/Images/Others/Photos/` `A_5`, `Y_5`, `M_5`, `N_5` | variantes de A e Y; M, N |
| `descargas/AME-Aprende-el-Metodo-En-Se-as-/assets/img/letra-<x>-v2.jpg` (27 tarjetas) | flechas de J, K, Ñ, Q, X; apoyo secundario para el resto |
| `descargas/Mexican-Sign-Language-Alphabet-Real-Time-Detection/data/<LETRA>/<LETRA>_0_D.jpg` y `_60_D.jpg` (A–Z); además `K_10_D`, `K_30_D`, `K_90_D`, `K_0_I`, `P_30_D`, `P_90_D`, `Q_30_D`, `Q_90_D`, `X_30_D` | apoyo secundario; discrepancias en G, H, P, Y |
| `descargas/Kenneth_DatasetLSM/Abecedario/QuerologiaBD.csv` (texto, no imagen) | orientación y movimiento de las 27 letras |

---

## 2. Clasificación: letras estáticas y letras con movimiento

### 2.1 Lo que dice cada fuente

| fuente | total | estáticas | con movimiento | LL / RR / CH |
|---|---|---|---|---|
| [CIC], [CIC-26], [CIC-Z] | 27 | 21: A, B, C, D, E, F, G, H, I, L, M, N, O, P, R, S, T, U, V, W, Y | 6: J, K, Ñ, Q, X, Z | no las trata |
| [DAK] (lámina) | 27 + regla | las 21 sin flecha | flechas en J, K, Ñ, Q, X, Z | recuadro «Letra doble»: la mano se desplaza de lado; aplica a LL y RR sin dibujarlas aparte |
| [UAQ] (artículo y CSV) | 27 | 21 (las mismas) | 6: J, K, Ñ, Q, X, Z | no aparecen |
| [UAEH] | 29 | 21 (las mismas) | 6: J, K, Ñ, Q, X, Z | LL y RR como señas dinámicas adicionales |
| [BUAP] | 29 | no clasifica | no clasifica | LL y RR incluidas como configuraciones |
| [MDPI] | 27 | 21 (sin listar) | «el resto» (sin listar) | no las trata |
| [UV] | — | 21 (las mismas) | no las incluye | — |
| [PADI-26a] | 27 | A–H «entre otras» | nombra solo J y Z | no las trata |
| [MAN] (fotos) | 27 | las 21 sin flecha | flechas en J, K, Ñ, Q, X, Z | no aparecen |
| [AME] (tarjetas) | 27 | — | flechas en J, K, Ñ, Q, X; la Z se dibuja con su trazo | no aparecen |
| [ROB] | 26 (sin Ñ) | trata todas como imágenes fijas | — | no aparecen |
| [WIKI] | 27 | no clasifica | no clasifica | — |
| [CRUZ] | — | — | describe el zig-zag de Z y el desplazamiento de LL | LL como ejemplo (p. 353) |

### 2.2 Síntesis y desacuerdos

- **Consenso (cinco fuentes independientes: CICESE, UAQ, UAEH, lámina [DAK], fotos [MAN]):** 21 estáticas y 6 con movimiento (J, K, Ñ, Q, X, Z).
- **Desacuerdo sobre el total:** 27 señas según CICESE, UAQ, MDPI y Wikipedia; 29 según [UAEH] y [BUAP], que suman LL y RR.
- **[PADI-26a]** nombra solo J y Z como letras con movimiento. El texto no dice que las demás sean estáticas; lo tomo como lista incompleta, no como postura contraria.
- **[ROB]** fotografía K, Q, X, J y Z como imágenes fijas y omite la Ñ; no es evidencia de que sean estáticas.
- **CH:** ninguna fuente consultada la incluye. No hay fila para CH en la tabla.
- **LL y RR:** incluidas por [UAEH], [BUAP] y la regla de «letra doble» de [DAK]; [CRUZ] documenta LL. Ninguna fuente muestra una imagen específica de RR.

---

## 3. Tabla por letra

Notas de lectura:

- Vocabulario de dedos: `extendido`, `cerrado`, `curvado`, `gancho`, `doblado en nudillo`. Pulgar: `al costado`, `sobre los dedos`, `sobre la palma`, `afuera`, `entre índice y medio`, `tocando <dedo>`.
- **Columna «diferencia con ASL»:** la única fuente que compara explícitamente LSM y ASL es [LIFE] (N, Ñ, vocales). En las demás celdas, «observado» significa que el rasgo se ve con claridad en imágenes LSM y difiere de la forma habitual de ASL; no hay fuente comparativa que lo respalde. Celda vacía = no verificado, no «igual a ASL».
- **Confianza:** `alta` = al menos dos fuentes LSM independientes coinciden, o una imagen clara que vi coincide con una fuente de texto. Aun así, ver la advertencia 2.

| letra | tipo | pulgar | índice | medio | anular | meñique | relaciones | orientación | diferencia con ASL | fuentes | confianza |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A | estática | extendido, `afuera` (separado del puño hacia el costado); en dos imágenes queda `al costado` del índice | cerrado | cerrado | cerrado | cerrado | puño; el pulgar no cruza por delante de los dedos | palma hacia el frente; nudillos arriba | observado: el pulgar suele separarse del puño | [DAK], [MAN] 37, [PDI] A_1/A_3/A_4 (afuera), [PDI] Photos/A_5 y [AME] (al costado), [ROB], [UAQ], [CRUZ] «pulgar alineado, extendido» | alta — cinco fuentes coinciden en el puño con pulgar extendido; cuánto se separa varía |
| B | estática | `sobre la palma` | extendido | extendido | extendido | extendido | cuatro dedos juntos | palma hacia el frente; dedos arriba | | [DAK], [MAN] 39, [PDI], [ROB], [UAQ], [CRUZ] «cuatro dedos abiertos, pulgar opuesto cerrado» | alta — texto e imágenes coinciden |
| C | estática | curvado, `afuera` (opuesto a los dedos, sin tocarlos) | curvado | curvado | curvado | curvado | cuatro dedos juntos; forman una C abierta con el pulgar | palma de lado, en diagonal hacia adentro y al frente (la C se ve de perfil); dedos arriba | | [DAK], [MAN] 41, [PDI], [ROB], [UAQ], [CRUZ] | alta — texto e imágenes coinciden |
| D | estática | `tocando medio` (también roza anular) | extendido | curvado | curvado | curvado | las yemas de medio, anular y meñique se apoyan en el pulgar formando un círculo; índice vertical | palma hacia el frente; índice arriba | | [DAK], [MAN] 43, [PDI] D_1/D_3/D_4, [ROB], [UAQ], [CRUZ] «pulgar en contacto» | alta — texto e imágenes coinciden |
| E | estática | `sobre la palma`, doblado bajo o junto a las yemas; no siempre las toca | gancho | gancho | gancho | gancho | cuatro dedos juntos; yemas hacia la parte alta de la palma; uñas visibles de frente | palma hacia el frente; nudillos arriba | | [DAK], [MAN] 45, [PDI] E_1–E_5, [ROB], [UAQ], [CRUZ] «cuatro dedos agrapados» | alta para los dedos; la posición exacta del pulgar varía (ver 4.8) |
| F | estática | `tocando índice` (yema del pulgar contra el índice doblado) | gancho (doblado sobre el pulgar) | extendido | extendido | extendido | pulgar e índice en contacto; medio, anular y meñique juntos | palma hacia el frente; dedos arriba | observado: los tres dedos van juntos y el índice se dobla sobre el pulgar, sin formar un círculo amplio | [DAK], [MAN] 47, [PDI] F_1–F_5, [ROB], [AME], [CRUZ] «pulgar toca al dedo seleccionado con la yema» | alta — texto e imágenes coinciden |
| G | estática | extendido, `afuera` (apunta arriba) | extendido | cerrado | cerrado | cerrado | pulgar e índice en ángulo recto (una L acostada) | palma hacia el signante; índice al lado, hacia adentro; pulgar arriba | observado: pulgar levantado, perpendicular al índice | [DAK], [MAN] 49, [PDI] G_1/G_3/G_4, [UAQ] «palma atrás, dedos adentro», [CRUZ]; [ROB] muestra la palma al frente | alta para la configuración; orientación con una fuente discrepante (ver 4.5) |
| H | estática | extendido, `afuera` (apunta arriba) | extendido | extendido | cerrado | cerrado | índice y medio juntos; pulgar perpendicular a ellos | palma hacia el signante; índice y medio al lado, hacia adentro; pulgar arriba | observado: pulgar levantado | [DAK], [MAN] 51, [PDI] H_1/H_3/H_4, [UAQ], [CRUZ]; [ROB] muestra la palma al frente | alta para la configuración; orientación como en G |
| I | estática | `sobre los dedos` | cerrado | cerrado | cerrado | extendido | puño con el meñique vertical | palma hacia el frente; meñique arriba | | [DAK], [MAN] 53, [PDI], [ROB], [UAQ], [CRUZ] «meñique extendido, pulgar opuesto cerrado» | alta — texto e imágenes coinciden |
| J | con movimiento: el meñique traza una J (baja y se curva hacia adentro) | `sobre los dedos` | cerrado | cerrado | cerrado | extendido | configuración de la I | inicia como la I; al final la palma gira hacia adentro | | [DAK] flecha, [MAN] 55 flecha, [UAQ] «medio círculo, arriba–abajo; palma frente → adentro», [AME], [CIC] | alta para la configuración y el trazo general; el giro final de la palma solo lo da [UAQ] |
| K | con movimiento: giro de muñeca de alrededor de un cuarto de círculo con la configuración de la P | `tocando medio` (entre índice y medio) | extendido | doblado en nudillo (recto, adelantado respecto del índice) | cerrado | cerrado | como la P | **en desacuerdo** (ver 4.1): [UAQ] inicia con palma al frente y dedos arriba, termina con palma abajo y dedos al frente; [MAN] mano vertical con flecha curva sobre las puntas; [DAK] y [PDI] mano horizontal, índice al lado y medio hacia abajo | observado: LSM añade movimiento | [DAK], [MAN] 57, [PDI] Others/K_BC, [UAQ] «configuración P», [AME], [ROB] | media — configuración respaldada por cinco fuentes; sentido del giro y posición inicial sin acuerdo |
| L | estática | extendido, `afuera` (apunta al lado) | extendido | cerrado | cerrado | cerrado | pulgar e índice en ángulo recto | palma hacia el frente; índice arriba | | [DAK], [MAN] 59, [PDI], [ROB], [UAQ], [CRUZ] | alta — texto e imágenes coinciden |
| LL | con movimiento: configuración de la L con desplazamiento lineal hacia el lado de la mano dominante | extendido, `afuera` | extendido | cerrado | cerrado | cerrado | como la L | como la L; la mano se desliza de lado frente al torso | | [CRUZ] ej. 60, p. 353 («desplazamiento lateral»), [DAK] «Letra doble»; contada como seña por [UAEH] y [BUAP] | media — dos fuentes coinciden en el desplazamiento lateral, pero no vi ninguna imagen específica de LL |
| M | estática | `sobre la palma` (oculto bajo la mano; no se ve en las imágenes) | extendido, apuntando abajo | extendido, apuntando abajo | extendido, apuntando abajo | cerrado | índice, medio y anular juntos, colgando | palma hacia el signante (quien mira ve el dorso); dedos abajo | observado: los tres dedos cuelgan extendidos con el dorso al frente, no doblados sobre el pulgar | [DAK], [MAN] 61, [PDI] M_1–M_5, [ROB], [AME], [UAQ] «palma atrás, dedos abajo», [CRUZ] «tres dedos aplanados, pulgar opuesto» | alta — texto e imágenes coinciden; ver 4.9 sobre dónde se dobla |
| N | estática | `sobre la palma` (oculto; no se ve) | extendido, apuntando abajo | extendido, apuntando abajo | cerrado | cerrado | índice y medio juntos, colgando | palma hacia el signante; dedos abajo | [LIFE]: similar a la N de ASL pero con índice y medio extendidos. Observado: dedos hacia abajo, dorso al frente | [DAK], [MAN] 63, [PDI] N_1–N_5, [ROB], [AME], [UAQ], [CRUZ] «índice y medio aplanados» | alta — texto e imágenes coinciden |
| Ñ | con movimiento: configuración de la N con vaivén lateral de la muñeca | `sobre la palma` (oculto) | extendido, apuntando abajo | extendido, apuntando abajo | cerrado | cerrado | como la N | como la N; las puntas oscilan de lado a lado | [LIFE]: se hace la N y se «dibuja» la tilde | [DAK] flecha doble, [MAN] 65 flecha doble, [UAQ] «medio círculo, adentro–afuera», [AME], [LIFE] | alta — cuatro fuentes coinciden en N más vaivén lateral |
| O | estática | `tocando índice` (yema con yema; también toca medio) | curvado | curvado | curvado | curvado | las yemas de los cuatro dedos se juntan con la del pulgar formando un círculo | palma de lado, en diagonal hacia adentro y al frente (el hueco se ve de frente); dedos arriba | | [DAK], [MAN] 67, [PDI], [ROB], [UAQ], [CRUZ] | alta — texto e imágenes coinciden |
| P | estática | `tocando medio` (la yema se apoya en el lado del medio que mira al índice) | extendido | doblado en nudillo (recto, apunta al frente) | cerrado | cerrado | índice y medio separados en planos distintos («apilados»); el pulgar queda entre ambos | índice arriba, medio al frente, palma de lado (cuatro fuentes visuales); [UAQ] la describe con palma abajo | observado: es la misma configuración que la K, pero sin movimiento | [DAK], [MAN] 69, [PDI] P_1–P_5, [AME], [CRUZ] pp. 317–318; [UAQ] discrepa en orientación; [ROB] muestra otra forma | alta para la configuración; orientación con una fuente discrepante (ver 4.2) |
| Q | con movimiento: mano colgando de la muñeca, con vaivén o giro de muñeca | extendido, `afuera` (opuesto al índice, apunta abajo) | curvado o gancho según la fuente | cerrado | cerrado | cerrado | índice y pulgar apuntan en paralelo, sin tocarse | muñeca arriba, índice y pulgar hacia abajo; [UAQ]: palma frente → abajo, dedos frente → diagonal abajo | observado: LSM añade movimiento | [DAK], [MAN] 71, [AME], [UAQ] «cuarto de círculo, frente–abajo», [CRUZ] «índice agrapado, pulgar opuesto extendido», [ROB] | media — la selección de dedos coincide; la curvatura del índice y el tipo de movimiento varían (ver 4.3) |
| R | estática | `sobre los dedos` (sujeta anular y meñique) | extendido | extendido | cerrado | cerrado | índice y medio cruzados (el medio cruza sobre el índice) | palma hacia el frente; dedos arriba | | [DAK], [MAN] 73, [PDI], [ROB], [UAQ], [CRUZ] pp. 316–318 | alta — texto e imágenes coinciden |
| RR | con movimiento: configuración de la R con desplazamiento lateral (regla de «letra doble») | `sobre los dedos` | extendido | extendido | cerrado | cerrado | índice y medio cruzados | como la R; la mano se desliza de lado | | [DAK] «Letra doble»; contada como seña por [UAEH] y [BUAP] | media — dos artículos confirman que existe; el movimiento solo lo indica la regla genérica de [DAK] |
| S | estática | `sobre los dedos` | cerrado | cerrado | cerrado | cerrado | puño; el pulgar cruza por delante de los dedos | palma hacia el frente; nudillos arriba | | [DAK], [MAN] 75, [PDI], [ROB], [UAQ], [CRUZ] «cuatro dedos cerrados, pulgar opuesto cerrado» | alta — texto e imágenes coinciden |
| T | estática | `entre índice y medio` (la punta asoma entre ambos) | cerrado (doblado sobre el pulgar) | cerrado | cerrado | cerrado | puño | palma hacia el frente; nudillos arriba | | [DAK], [MAN] 77, [PDI] T_3/T_5, [ROB], [AME], [UAQ], [CRUZ] CM 68; [CRUZ] registra además una variante libre (ver 4.7) | alta para la forma en puño; existe una variante documentada |
| U | estática | `sobre los dedos` (sujeta anular y meñique) | extendido | extendido | cerrado | cerrado | índice y medio juntos | palma hacia el frente; dedos arriba | | [DAK], [MAN] 79, [PDI], [ROB], [UAQ], [CRUZ] | alta — texto e imágenes coinciden |
| V | estática | `sobre los dedos` (sujeta anular y meñique) | extendido | extendido | cerrado | cerrado | índice y medio separados en V | palma hacia el frente; dedos arriba | | [DAK], [MAN] 81, [PDI], [ROB], [UAQ], [CRUZ] «separados» | alta — texto e imágenes coinciden |
| W | estática | `tocando meñique` (sujeta el meñique doblado) | extendido | extendido | extendido | cerrado | índice, medio y anular separados | palma hacia el frente; dedos arriba | | [DAK], [MAN] 83, [PDI], [ROB], [UAQ], [CRUZ] «tres dedos separados» | alta — texto e imágenes coinciden |
| X | con movimiento: lineal, de enfrente hacia atrás (la mano se retrae hacia el cuerpo) | `al costado` (apoyado junto al índice, arriba); poco claro | gancho | cerrado | cerrado | cerrado | puño con el índice en gancho | mano horizontal; palma hacia adentro (de lado); nudillos al frente | observado: LSM añade movimiento y coloca la mano horizontal | [DAK] (nota de texto y flecha), [MAN] 85 flecha doble, [UAQ] «lineal, frente–atrás; palma adentro», [AME], [ROB] | media — eje del movimiento respaldado por [DAK] y [UAQ]; pulgar y recorrido exacto poco claros (ver 4.4) |
| Y | estática | extendido, `afuera` | cerrado | cerrado | cerrado | extendido | pulgar y meñique abiertos en direcciones opuestas | palma hacia el signante, mano de lado: pulgar arriba, meñique hacia adentro y algo abajo; dos fuentes la muestran con la palma al frente | observado: dorso hacia quien mira y mano de lado | [DAK], [MAN] 87, [PDI] Y_1/Y_3/Y_4, [UAQ] «palma atrás, dedos adentro», [CRUZ]; [ROB] y [PDI] Photos/Y_5 muestran la palma al frente | alta para la configuración; media para la orientación (ver 4.6) |
| Z | con movimiento: el índice traza una Z en el aire | `sobre los dedos` | extendido | cerrado | cerrado | cerrado | — | palma hacia el frente; índice arriba | | [DAK], [MAN] 89, [UAQ] «zigzag», [CRUZ] pp. 274–275 («dos cambios de orientación»), [AME] | alta — cuatro fuentes coinciden |

Letras sin fila: **CH** (ausente en todas las fuentes consultadas).

---

## 4. Dudas y desacuerdos

### 4.1 K — sentido del giro y posición inicial
Todas las fuentes coinciden en que la K usa la configuración de la P y lleva un giro de muñeca. No coinciden en cómo:
- [UAQ]: la mano empieza vertical (palma al frente, dedos arriba) y gira un cuarto de círculo hacia el frente y abajo, hasta quedar con la palma abajo y los dedos al frente.
- [DAK]: dibuja la mano horizontal (índice al lado, medio hacia abajo) con una flecha que apunta hacia arriba.
- [PDI] `Others/K_BC.jpg`: mano horizontal, sin indicación de movimiento.
- [MAN] 57: mano vertical con una flecha curva de una sola punta sobre las yemas, que no permite saber si el giro es en profundidad o lateral.
- [AME]: arco con punta en ambos extremos (vaivén).

Lo que no se sabe: si el giro va de vertical a horizontal o al revés, y si es un movimiento único o un vaivén. **No conviene que la app evalúe el movimiento de la K hasta validarlo.**

### 4.2 P — orientación
[DAK], [MAN], [PDI] (cinco manos) y [AME] muestran el índice hacia arriba y el medio hacia el frente. [UAQ] la describe con la palma hacia abajo y los dedos en diagonal hacia adentro y al frente, es decir, con la mano horizontal. En [UAQ] esa orientación horizontal es justo donde termina su K. [ROB] muestra para P un puño con el pulgar extendido, que no coincide con nada; lo descarté. Queda la duda de si existen dos orientaciones en uso o si la tabla de [UAQ] refleja la costumbre de un solo señante.

### 4.3 Q — forma del índice y tipo de movimiento
- Forma: [CRUZ] transcribe el índice como «agrapado» (en gancho) con pulgar opuesto extendido; en [MAN] 71 y [AME] el índice se ve casi recto apuntando abajo; en [DAK] se ve curvado.
- Movimiento: [UAQ] dice cuarto de círculo de frente hacia abajo; [DAK], [MAN] y [AME] dibujan un arco con punta en ambos extremos bajo las yemas (vaivén).
- [ROB] muestra índice y pulgar en paralelo apuntando al lado, sin movimiento visible.

### 4.4 X — pulgar y recorrido
El eje frente–atrás lo respaldan [DAK] (nota escrita) y [UAQ]. [MAN] dibuja una flecha de dos puntas; [AME] dibuja una flecha en forma de «Λ» que podría ser el mismo vaivén visto en perspectiva. No queda claro si el movimiento es único (hacia el cuerpo) o repetido. La posición del pulgar no se distingue bien en ninguna imagen.

### 4.5 G y H — hacia dónde mira la palma
[UAQ] (texto), [PDI] y [MAN] (fotos) coinciden: palma hacia el signante, quien mira ve el dorso. [ROB] muestra la palma hacia la cámara. Le doy más peso a las tres primeras.

### 4.6 Y — orientación
[UAQ] da palma hacia atrás y dedos hacia adentro (igual que G y H); [MAN] 87, [DAK] y [PDI] `KBImages` muestran el dorso y la mano de lado. [ROB] y [PDI] `Photos/Y_5` muestran la palma hacia el frente; en la segunda, además, la mano está vertical. La configuración (pulgar y meñique extendidos) no está en duda.

### 4.7 T — variante
La forma en puño con el pulgar entre índice y medio aparece en [DAK], [MAN], [PDI], [ROB] y [AME], y concuerda con la configuración CM 68 de [CRUZ] (índice cerrado, dedos no seleccionados cerrados). [CRUZ] registra además una «variante libre» (CM 74) cuya notación indica dedos no seleccionados no cerrados y contacto del pulgar con el índice, es decir, una forma parecida a la F. No vi ninguna imagen de esa variante y la lectura depende de mi interpretación de la notación.

### 4.8 A y E — posición del pulgar
- A: el pulgar aparece claramente separado del puño en [DAK], [MAN], [ROB] y tres fotos de [PDI]; aparece pegado al costado del índice en [PDI] `Photos/A_5` y en [AME]. La app no debería penalizar ninguna de las dos.
- E: el pulgar aparece doblado sobre la palma por debajo de las yemas ([DAK], [PDI] E_1/E_2) o doblado al costado ([MAN] 45, [PDI] E_3/E_5). En ninguna foto las yemas descansan sobre el pulgar. [CRUZ] lo transcribe como pulgar alineado y aplanado con la falange distal activa.

### 4.9 M, N, Ñ — dónde se dobla la mano
En las fotos los dedos y el dorso quedan casi en un mismo plano y la flexión parece estar en la muñeca. [CRUZ] los transcribe como dedos «aplanados», que en su sistema equivale a doblar en el nudillo de la base. Para el seguimiento con 21 puntos importa: conviene aceptar ambas y evaluar sobre todo que los dedos apunten hacia abajo. El pulgar no se ve en ninguna imagen; «sobre la palma» es la lectura de «pulgar opuesto» en [CRUZ], no una observación directa. Por otro lado, [LIFE] dice que la N de LSM es como la de ASL pero con índice y medio extendidos hacia el frente o hacia fuera, lo que solo coincide en parte con las imágenes (dedos hacia abajo).

### 4.10 LL y RR
- LL: [CRUZ] describe un desplazamiento lineal hacia el lado de la mano dominante con la configuración de la L; [DAK] da la regla genérica de «letra doble» con flechas laterales. No hay imagen específica.
- RR: solo la regla genérica de [DAK]. [UAEH] y [BUAP] la cuentan como seña, sin describirla.
- No encontré ninguna fuente que diga si hoy se enseñan como letras propias o solo como letra repetida.

### 4.11 D y F — detalles menores
- D: [CRUZ] selecciona índice y medio «apilados» con el pulgar en contacto; en las fotos, medio, anular y meñique se curvan juntos sobre el pulgar. No lo considero contradictorio, pero no pude ver su ilustración.
- F: el punto exacto de contacto (yema del pulgar con la yema o con el costado del índice) varía entre fotos.

### 4.12 Perspectiva de las láminas
[DAK] dibuja las señas como en un espejo. Las fotos de [PDI] y [MAN] están tomadas de frente. Las tarjetas de [AME] no indican perspectiva. Al pasar esto a la app hay que fijar una sola convención y decirla en pantalla.

### 4.13 Lo que no pude verificar
- Ninguna fila está contrastada con «Manos con Voz», el DIELSEME ni el apéndice de dactilología del INDEPEDI.
- No pude confirmar de dónde provienen las fotos de [MAN].
- No vi los videos de letras dinámicas del CICESE ([CIC-Z]), que serían la mejor evidencia para K, Q y X.
- [CRUZ] se leyó a través de un extractor automático de texto; la decodificación de su notación puede contener errores.
- No encontré datos sobre variación regional del alfabeto manual.

---

## 5. Notas culturales

1. **El deletreo es una parte pequeña de la LSM.** El alfabeto manual es «un conjunto de 27 señas» que corresponden a letras del español; la mayoría de las personas Sordas señantes evita deletrear y lo reserva sobre todo para nombres de personas y lugares sin seña propia, o para presentar una seña nueva [WIKI]. La gramática de Cruz Aldrete lo describe como un recurso para tomar prestadas palabras del español, presentar a una persona o nombrar algo que aún no tiene seña ([CRUZ], sección 5.4, pp. 536–538). En el diccionario del INDEPEDI los nombres propios deletreados se marcan aparte del resto de las señas [INDEPEDI]. Saber el abecedario no equivale a saber LSM.

2. **La LSM es una lengua nacional reconocida por ley.** El artículo 14 de la Ley General para la Inclusión de las Personas con Discapacidad (DOF, 30 de mayo de 2011) dice que la LSM «es reconocida oficialmente como una lengua nacional» y forma parte del patrimonio lingüístico del país ([WIKI]; [INDEPEDI], p. 29; [ENTS]). El primer reconocimiento federal data del 10 de junio de 2005, fecha en que se conmemora el Día Nacional de la LSM ([INDEPEDI], p. 17; [CRUZ], cap. 2, p. 152; [EFE]). La Constitución de la Ciudad de México también la reconoce ([INDEPEDI]; [ENTS]).

3. **«Sordo/Sorda» con mayúscula.** En la bibliografía mexicana reciente se escribe «sordo» con minúscula para la condición auditiva y «Sordo» con mayúscula para la identidad cultural y lingüística: «la «S» mayúscula expresa un sentido de identidad, orgullo y comunidad» ([TOL], p. 19, nota 1). Cruz Aldrete y el INDEPEDI escriben «comunidad Sorda» ([CRUZ], cap. 2, p. 153; [INDEPEDI]).

4. **La LSM no deriva de la ASL.** Pertenece a la familia de la lengua de señas francesa; Smith-Stark la encontró más cercana a la LIBRAS brasileña que a la ASL, y la influencia de la ASL se limita sobre todo a préstamos en la frontera norte ([CRUZ], cap. 2, pp. 143–146; [WIKI]). Es un buen motivo para que la app no reutilice formas de ASL.

5. **No hay cifra oficial de usuarios.** La ENTS-UNAM y el COPRED señalan que no existe una estadística oficial de señantes de LSM [ENTS]; las estimaciones citadas van de 87 000–100 000 (Smith-Stark, 1986) a unas 300 000 (2022) [WIKI]. El censo de 2020 registró 1 350 802 personas que no oyen ni con aparato auditivo, cifra que cuenta personas sordas y no usuarias de LSM ([TOL], pp. 27–28).
