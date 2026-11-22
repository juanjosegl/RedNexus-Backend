# Prueba BE-19: flujo completo en Swagger

- Fecha: 2026-11-22
- Quién probó: Alejandra Guzmán
- Dónde: http://localhost:3000/api/docs (backend, worker, Postgres y Redis locales; IA en modo `mock`)

| # | Paso | Resultado esperado | ¿Pasó? (sí/no) | Notas |
| --- | --- | --- | --- | --- |
| 1 | `POST /api/auth/register` con tu correo de prueba y `"acceptsDataPolicy": true` | 201 y un `accessToken` | sí | 201 con `accessToken`. Usuario de prueba `alejandra.prueba@example.com`. |
| 2 | Botón **Authorize** con el token | El candado se cierra | sí | Swagger mostró "Authorized" y el candado quedó cerrado. |
| 3 | `PATCH /api/users/me` con una bio y etiquetas | 200 con tu perfil | sí | 200 con la bio y las etiquetas guardadas. |
| 4 | `POST /api/help-requests` con una duda de 10 a 1000 letras | 201, estado `PENDING` | sí | 201. (confirmar el estado `PENDING` antes de guardar) |
| 5 | Esperar 30 s y `GET /api/help-requests/{id}` | Estado `MATCHED` y hasta 3 candidatos con explicación | sí | `MATCHED` con 2 candidatos (Ana Gómez y Julián Ceballos), cada uno con su explicación. |
| 6 | Entrar como `ana.demo@rednexus.dev` (clave `demo12345`) y `GET /api/matches/incoming` | Lista de solicitudes donde Ana es candidata | sí | 200. Aparece la solicitud de Alejandra; el autor solo muestra el nombre, sin correo. |
| 7 | `POST /api/matches/{id}/accept` como el candidato | 200 con el correo del autor | sí | La base de datos muestra el match en `ACCEPTED`. No se alcanzó a ver el 200 con `authorEmail`: un segundo intento devolvió 409 "Ya respondiste a esta solicitud", esperado en un match ya aceptado. |
| 8 | Volver a tu usuario y `POST /api/ratings` con 5 estrellas | 201 | sí | 201. |
| 9 | Repetir el paso 8 | 409 "Ya calificaste esta solicitud" | sí | 409 "Ya calificaste esta solicitud". |
| 10 | Cualquier ruta sin token (botón **Logout**) | 401 | sí | `GET /api/users/me` sin token: 401 "Falta el token". Swagger marca ese 401 como "Undocumented". |
