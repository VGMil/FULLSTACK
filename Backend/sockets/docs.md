# 📚 WebSocket Events - Fingerprint Authentication System

Este documento describe los eventos del sistema de autenticación por huella digital que utiliza un backend, frontend y un ESP32.

Todos los eventos viajan a través de WebSockets y comparten una estructura común, con un campo `status` que permite unificar múltiples flujos bajo un solo nombre de evento.

---

## 🧩 Estructura general de los eventos

```json
{
  "event": "<event_name>",
  "status": "<success|error|info>",
  "context": "<auth|register|none>",
  "payload": {},
  "origin": "<frontend|server|ESP32>",
  "timestamp": "2025-05-05T12:00:00.000Z"
}
```

| Campo       | Tipo   | Descripción                                                   |
| ----------- | ------ | ------------------------------------------------------------- |
| `event`     | string | Nombre del evento base.                                       |
| `status`    | string | `success`, `error`, o `info`. Indica el resultado del evento. |
| `context`   | string | Contexto de la operación: `auth`, `register`, o `none`.       |
| `payload`   | object | Contiene los datos específicos del evento.                    |
| `origin`    | string | Fuente del evento: `frontend`, `server` o `ESP32`.            |
| `timestamp` | string | Marca de tiempo en formato ISO 8601.                          |

---

## 📋 Lista de eventos

### 1. `ready_scan`

* **Emisor:** `server`
* **Receptor:** `frontend`
* **Descripción:** Indica que el sistema está listo para escanear una huella.

```json
{
  "event": "ready_scan",
  "status": "info",
  "context": "none",
  "payload": {},
  "origin": "server",
  "timestamp": "..."
}
```

---

### 2. `scan_request`

#### ✅ Éxito

* **Emisor:** `server`
* **Receptor:** `ESP32`
* **Descripción:** La solicitud de escaneo fue aceptada y enviada al ESP32.

```json
{
  "event": "scan_request",
  "status": "success",
  "context": "auth",
  "payload": {},
  "origin": "server",
  "timestamp": "..."
}
```

#### ❌ Error

* **Emisor:** `server`
* **Receptor:** `frontend`
* **Descripción:** El servidor no pudo procesar la solicitud de escaneo.

```json
{
  "event": "scan_request",
  "status": "error",
  "context": "auth",
  "payload": {
    "reason": "device_busy"
  },
  "origin": "server",
  "timestamp": "..."
}
```

---

### 3. `scan_confirm`

* **Emisor:** `server`
* **Receptor:** `frontend`
* **Descripción:** Segunda lectura de huella aceptada.

```json
{
  "event": "scan_confirm",
  "status": "success",
  "context": "register",
  "payload": {
    "user_id": 10
  },
  "origin": "server",
  "timestamp": "..."
}
```

---

### 4. `scan_successful`

#### ✅ Éxito

* **Emisor:** `ESP32`
* **Receptor:** `server`
* **Descripción:** Huella escaneada correctamente y enviada al backend.

```json
{
  "event": "scan_successful",
  "status": "success",
  "context": "register",
  "payload": {
    "user_id": 12,
    "fingerprint_data": "<base64>"
  },
  "origin": "ESP32",
  "timestamp": "..."
}
```

#### ❌ Error

* **Emisor:** `server`
* **Receptor:** `frontend`
* **Descripción:** La huella fue escaneada, pero no fue válida o no coincidió.

```json
{
  "event": "scan_successful",
  "status": "error",
  "context": "register",
  "payload": {
    "user_id": 12,
    "reason": "fingerprint_mismatch"
  },
  "origin": "server",
  "timestamp": "..."
}
```

---
