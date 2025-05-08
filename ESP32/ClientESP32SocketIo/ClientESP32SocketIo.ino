#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Adafruit_Fingerprint.h>

HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);
uint8_t fingerID = 1;

// Configuración Wi-Fi
const char* ssid = "SERVER-ESP";
const char* password = "012345678";
const char* host = "192.168.137.1";
const uint16_t port = 3001;
const char* path = "/";

WebSocketsClient webSocket;
StaticJsonDocument<200> PayloadResponse;
bool isScanning = false;

uint8_t downloadFingerprintTemplate(int id, const char* context, JsonObject payload);
String printHexString(uint8_t* data, size_t len, int precision);
uint8_t getFingerprintEnroll(int id, const char* context, JsonObject payload);
JsonObject makePayloadMessage(const char* mensaje);
JsonObject mergePayloads(JsonObject payload1, JsonObject payload2);

String crearMensajeJson(const char* evento, const char* estado, const char* contexto, JsonObject payload) {
  StaticJsonDocument<256> doc;
  doc["event"] = evento;
  doc["status"] = estado;
  doc["context"] = contexto;
  doc["origin"] = "ESP32";
  doc["payload"] = payload;
  String jsonString;
  serializeJson(doc, jsonString);
  return jsonString;
}

void onWebSocketConnected() {
  StaticJsonDocument<32> emptyDoc;
  String mensaje = crearMensajeJson("ready_scan", "info", "", emptyDoc.to<JsonObject>());
  webSocket.sendTXT(mensaje);
}

void onScanRequest(const char* status, const char* context, JsonObject payload) {
  String mensaje = crearMensajeJson("scan_request", status, context, payload);
  webSocket.sendTXT(mensaje);
}

void onScanConfirm(const char* status, const char* context, JsonObject payload) {
  String mensaje = crearMensajeJson("scan_confirm", status, context, payload);
  webSocket.sendTXT(mensaje);
}

void onScanDone(const char* status, const char* context, JsonObject payload) {
  String mensaje = crearMensajeJson("scan_done", status, context, payload);
  webSocket.sendTXT(mensaje);
}

void payloadsEvents(uint8_t* payload) {
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (error) {
    Serial.print("[Error] Falló el parseo de JSON: ");
    Serial.println(error.c_str());
    return;
  }

  const char* evento = doc["event"];
  const char* status = doc["status"];
  const char* contexto = doc["context"];
  JsonObject payloadObj = doc["payload"].as<JsonObject>();

  if (strcmp(evento, "scan_request") == 0 && strcmp(status, "info") == 0) {
    if (isScanning) {
      Serial.println("[Acción] Escaneo en curso, ignorando scan_request");
      return;
    }
    isScanning = true;
    Serial.println("[Acción] Iniciando escaneo...");
    uint8_t enrollResult = getFingerprintEnroll(fingerID, contexto, payloadObj);
    if (enrollResult == FINGERPRINT_OK) {
      uint8_t downloadResult = downloadFingerprintTemplate(fingerID, contexto, payloadObj);
      if (downloadResult == FINGERPRINT_OK) {
        onScanDone("success", contexto, payloadObj);
      } else {
        onScanDone("error", contexto, makePayloadMessage("Error al descargar plantilla"));
      }
    } else {
      onScanDone("error", contexto, makePayloadMessage("Error al registrar huella"));
    }
    isScanning = false;
  }
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("[WebSocket] Desconectado del servidor");
      break;
    case WStype_CONNECTED:
      Serial.println("[WebSocket] Conectado al servidor");
      onWebSocketConnected();
      break;
    case WStype_TEXT:
      Serial.printf("[WebSocket] Mensaje recibido: %s\n", payload);
      payloadsEvents(payload);
      break;
    case WStype_ERROR:
      Serial.println("[WebSocket] Error");
      break;
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Extractor de Huella dactilar");
  
  // Limpiar puerto serie
  while (mySerial.available()) {
    mySerial.read();
  }
  mySerial.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);

  // Verificar sensor con reintentos
  int sensorRetries = 3;
  bool sensorDetected = false;
  while (sensorRetries > 0 && !sensorDetected) {
    if (finger.verifyPassword()) {
      Serial.println("Existe el sensor!");
      sensorDetected = true;
    } else {
      Serial.println("Sensor no detectado. Reintentando...");
      sensorRetries--;
      delay(1000);
      while (mySerial.available()) {
        mySerial.read();
      }
    }
  }
  if (!sensorDetected) {
    Serial.println("Error: Sensor no detectado después de reintentos. Reiniciando...");
    ESP.restart();
  }

  Serial.printf("Conectando a %s...\n", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[WiFi] Conectado con IP: ");
  Serial.println(WiFi.localIP());

  webSocket.begin(host, port, path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
}

uint8_t downloadFingerprintTemplate(int id, const char* context, JsonObject payload) {
  Serial.println("------------------------------------");
  Serial.print("Attempting to load #"); Serial.println(id);
  uint8_t p = finger.loadModel(id);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.print("Template "); Serial.print(id); Serial.println(" loaded");
      break;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Loaded model Communication error");
      return p;
    default:
      Serial.print("Unknown error "); Serial.println(p);
      return p;
  }

  Serial.print("Attempting to get #"); Serial.println(id);
  p = finger.getModel();
  switch (p) {
    case FINGERPRINT_OK:
      Serial.print("Template "); Serial.print(id); Serial.println(" transferring:");
      break;
    default:
      Serial.print("Unknown error "); Serial.println(p);
      return p;
  }

  uint8_t bytesReceived[534];
  memset(bytesReceived, 0xff, 534);
  uint32_t starttime = millis();
  int i = 0;
  while (i < 534 && (millis() - starttime) < 20000) {
    if (mySerial.available()) {
      bytesReceived[i++] = mySerial.read();
    }
    delay(1); // Pequeña pausa para estabilidad
  }
  Serial.print(i); Serial.println(" bytes read.");
  Serial.println("Decoding packet...");

  uint8_t fingerTemplate[512];
  memset(fingerTemplate, 0xff, 512);
  int uindx = 9, index = 0;
  memcpy(fingerTemplate + index, bytesReceived + uindx, 256);
  uindx += 256;
  uindx += 2;
  uindx += 9;
  index += 256;
  memcpy(fingerTemplate + index, bytesReceived + uindx, 256);

  String templateHex = printHexString(fingerTemplate, 512, 2);
  Serial.println(templateHex);
  Serial.println("\ndone.");
  payload["fingerprint_data"] = templateHex;
  return p;
}

String printHexString(uint8_t* data, size_t len, int precision) {
  String hexStr = "";
  char tmp[16];
  char format[10];
  sprintf(format, "%%0%dX", precision);
  for (size_t i = 0; i < len; ++i) {
    sprintf(tmp, format, data[i]);
    hexStr += tmp;
  }
  return hexStr;
}

uint8_t getFingerprintEnroll(int id, const char* context, JsonObject payload) {
  int p = -1;
  int retries = 5; // Más reintentos
  Serial.print("Waiting for valid finger to enroll as #"); Serial.println(id);

  // Limpiar puerto serie
  while (mySerial.available()) {
    mySerial.read();
  }

  // Primera captura
  while (retries > 0) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        retries = 0;
        break;
      case FINGERPRINT_NOFINGER:
        Serial.print(".");
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("GetImage Communication error");
        onScanRequest("error", context, makePayloadMessage("GetImage Communication error"));
        retries--;
        if (retries == 0) return p;
        delay(500); // Más tiempo para recuperarse
        while (mySerial.available()) {
          mySerial.read();
        }
        break;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        onScanRequest("error", context, makePayloadMessage("Imaging error"));
        retries--;
        if (retries == 0) return p;
        delay(500);
        while (mySerial.available()) {
          mySerial.read();
        }
        break;
      default:
        Serial.print("Unknown error "); Serial.println(p);
        onScanRequest("error", context, makePayloadMessage("Unknown error"));
        retries--;
        if (retries == 0) return p;
        delay(500);
        while (mySerial.available()) {
          mySerial.read();
        }
        break;
    }
    delay(100);
  }
  if (p != FINGERPRINT_OK) return p;

  p = finger.image2Tz(1);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      onScanRequest("success", context, payload);
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Converted Communication error");
      onScanRequest("error", context, makePayloadMessage("Converted Communication error"));
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      onScanRequest("error", context, makePayloadMessage("Communication error"));
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      onScanRequest("error", context, makePayloadMessage("Could not find fingerprint features"));
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      onScanRequest("error", context, makePayloadMessage("Could not find fingerprint features"));
      return p;
    default:
      Serial.print("Unknown error "); Serial.println(p);
      onScanRequest("error", context, makePayloadMessage("Unknown error"));
      return p;
  }

  Serial.println("Remove finger");
  onScanConfirm("info", context, payload);
  delay(1000); // Más tiempo para retirar el dedo
  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
    delay(100);
  }

  Serial.print("ID "); Serial.println(id);
  Serial.println("Place same finger again");
  retries = 5;
  while (mySerial.available()) {
    mySerial.read();
  }
  while (retries > 0) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        retries = 0;
        break;
      case FINGERPRINT_NOFINGER:
        Serial.print(".");
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Remove Finger Communication error");
        onScanConfirm("error", context, makePayloadMessage("Remove Finger Communication error"));
        retries--;
        if (retries == 0) return p;
        delay(500);
        while (mySerial.available()) {
          mySerial.read();
        }
        break;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        onScanConfirm("error", context, makePayloadMessage("Imaging error"));
        retries--;
        if (retries == 0) return p;
        delay(500);
        while (mySerial.available()) {
          mySerial.read();
        }
        break;
      default:
        Serial.print("Unknown error "); Serial.println(p);
        onScanConfirm("error", context, makePayloadMessage("Unknown error"));
        retries--;
        if (retries == 0) return p;
        delay(500);
        while (mySerial.available()) {
          mySerial.read();
        }
        break;
    }
    delay(100);
  }
  if (p != FINGERPRINT_OK) return p;

  p = finger.image2Tz(2);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      onScanConfirm("error", context, makePayloadMessage("Image too messy"));
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Again Converted Communication error");
      onScanConfirm("error", context, makePayloadMessage("Again Converted Communication error"));
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      onScanConfirm("error", context, makePayloadMessage("Could not find fingerprint features"));
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      onScanConfirm("error", context, makePayloadMessage("Could not find fingerprint features"));
      return p;
    default:
      Serial.print("Unknown error "); Serial.println(p);
      onScanConfirm("error", context, makePayloadMessage("Unknown error"));
      return p;
  }

  Serial.print("Creating model for #"); Serial.println(id);
  p = finger.createModel();
  if (p == FINGERPRINT_OK) {
    Serial.println("Prints matched!");
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Creating model Communication error");
    onScanConfirm("error", context, makePayloadMessage("Creating model Communication error"));
    return p;
  } else if (p == FINGERPRINT_ENROLLMISMATCH) {
    Serial.println("Fingerprints did not match");
    onScanConfirm("error", context, makePayloadMessage("Fingerprints did not match"));
    return p;
  } else {
    Serial.print("Unknown error "); Serial.println(p);
    onScanConfirm("error", context, makePayloadMessage("Unknown error"));
    return p;
  }

  Serial.print("ID "); Serial.println(id);
  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("Stored!");
    onScanConfirm("success", context, payload);
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Store Communication error");
    onScanConfirm("error", context, makePayloadMessage("Store Communication error"));
    return p;
  } else if (p == FINGERPRINT_BADLOCATION) {
    Serial.println("Store Location error");
    onScanConfirm("error", context, makePayloadMessage("Store Location error"));
    return p;
  } else if (p == FINGERPRINT_FLASHERR) {
    Serial.println("Error writing to flash");
    onScanConfirm("error", context, makePayloadMessage("Error writing to flash"));
    return p;
  } else {
    Serial.print("Unknown error "); Serial.println(p);
    onScanConfirm("error", context, makePayloadMessage("Unknown error"));
    return p;
  }

  return p;
}

JsonObject makePayloadMessage(const char* mensaje) {
  static StaticJsonDocument<128> doc;
  doc.clear();
  doc["mensaje"] = mensaje;
  return doc.as<JsonObject>();
}

JsonObject mergePayloads(JsonObject payload1, JsonObject payload2) {
  static StaticJsonDocument<512> mergedDoc;
  mergedDoc.clear();
  for (JsonPair kv : payload1) {
    mergedDoc[kv.key()] = kv.value();
  }
  for (JsonPair kv : payload2) {
    mergedDoc[kv.key()] = kv.value();
  }
  return mergedDoc.as<JsonObject>();
}