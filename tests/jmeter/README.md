# JMeter Tests - Módulo Usuarios

Este directorio contiene los tests de performance y carga para el módulo de Usuarios.

## Archivos

- `users-performance-test.jmx` - Plan de pruebas JMeter con 5 tests para usuarios
- `run-jmeter.bat` - Script para ejecutar las pruebas desde línea de comandos

## Tests Incluidos

1. **GET /api/users** - Obtener lista de usuarios
2. **GET /api/users/:id** - Obtener usuario específico
3. **POST /api/users** - Crear nuevo usuario
4. **PUT /api/users/:id** - Actualizar usuario existente
5. **DELETE /api/users/:id** - Eliminar usuario

## Configuración

Las pruebas están configuradas con:
- **Threads**: 10 usuarios concurrentes
- **Ramp Up**: 5 segundos (escalado gradual)
- **Duration**: 60 segundos
- **Base URL**: http://localhost:3000

## Ejecución Manual

### Opción 1: GUI de JMeter
```bash
jmeter -t users-performance-test.jmx
```

### Opción 2: Línea de comandos
```bash
jmeter -n -t users-performance-test.jmx -l results.jtl -j jmeter.log
```

### Opción 3: Script batch
```bash
run-jmeter.bat "C:\Path\To\JMeter" "users-performance-test.jmx" "results.jtl"
```

## Requisitos

- JMeter 5.4 o superior instalado
- Backend ejecutándose en http://localhost:3000
- Los endpoints de usuarios deben estar disponibles

## Interpretación de Resultados

Los resultados se guardan en `results.jtl` en formato CSV:
- **Response Time**: Tiempo de respuesta en ms
- **Status**: 200 = OK, 4xx = Error del cliente, 5xx = Error del servidor
- **Throughput**: Solicitudes por segundo

## Variables Personalizables

En el archivo .jmx, puedes modificar:
- `BASE_URL`: URL base de la aplicación
- `THREADS`: Número de usuarios simultáneos
- `RAMP_UP`: Tiempo de escalado en segundos
- `DURATION`: Duración total de la prueba en segundos
