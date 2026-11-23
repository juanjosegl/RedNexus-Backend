# Prueba BE-20: datos personales (Ley 1581)

- **Fecha:** 22/11/2026
- **Quién probó:** Alejandra Guzmán

| #   | Paso                                                       | Resultado esperado                                                             | ¿Pasó? (sí/no) | Notas                                                                                                                                                                                                        |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `POST /api/auth/register` con `"acceptsDataPolicy": false` | 400 con un mensaje claro                                                       | Sí             | HTTP 400. El backend rechaza el registro y muestra el mensaje: "Debes autorizar el tratamiento de tus datos personales para registrarte".                                                                    |
| 2   | Registrarse con `"acceptsDataPolicy": true`                | 201                                                                            | Sí             | HTTP 201. El usuario se registró correctamente al aceptar la política de tratamiento de datos.                                                                                                               |
| 3   | `GET /api/users/me/export`                                 | Un JSON con todo lo tuyo (perfil, solicitudes, calificaciones), sin contraseña | Sí             | HTTP 200. Devuelve perfil, correo, consentimiento y colecciones de solicitudes, postulaciones, calificaciones y PQRS. No expone contraseña ni hash. Las colecciones están vacías porque el usuario es nuevo. |
| 4   | `GET /api/users/{id}` de otro usuario                      | Su perfil público sin correo                                                   | Sí             | HTTP 200. Se consultó el perfil de un segundo usuario. La respuesta contiene ID, nombre, biografía, etiquetas y calificación, sin correo electrónico ni contraseña.                                          |
| 5   | `DELETE /api/users/me`                                     | 204                                                                            | Sí             | HTTP 204. El backend confirmó la eliminación de la cuenta del usuario autenticado.                                                                                                                           |
| 6   | Repetir `GET /api/users/me` con el mismo token             | 401 o 404                                                                      | Sí             | HTTP 404. Al consultar el perfil con el mismo token después de eliminar la cuenta, el backend responde "El usuario no existe".                                                                               |
| 7   | `POST /api/auth/login` con el usuario borrado              | 401                                                                            | Sí             | HTTP 401. El backend rechaza el inicio de sesión con las credenciales de la cuenta eliminada.                                                                                                                |

## Observaciones generales

- Las siete pruebas se realizaron manualmente desde Swagger.
- Se utilizaron cuentas exclusivas para las pruebas.
- Se verificó el rechazo del registro sin consentimiento.
- Se comprobó la exportación de datos personales sin exponer contraseñas.
- Se verificó que el perfil público no expone el correo electrónico.
- Se comprobó la eliminación de la cuenta y la imposibilidad de acceder o iniciar sesión posteriormente.
- Todas las pruebas cumplieron los resultados esperados.
