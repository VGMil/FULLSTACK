#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Adafruit_Fingerprint.h>

HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);
uint8_t fingerID = 1;
// Configuración Wi-Fi
const char* ssid     = "SERVER-ESP";
const char* password = "012345678";

const char* host = "192.168.137.1";
const uint16_t port = 3001;
const char* path = "/"; 

WebSocketsClient webSocket;
StaticJsonDocument<200> PayloadResponse;

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
  String mensaje = crearMensajeJson(
    "ready_scan",
    "info",
    "",
    emptyDoc.to<JsonObject>()
  );

  webSocket.sendTXT(mensaje);
}

void onScanRequest(const char* status, const char* context, JsonObject payload){
  String mensaje = crearMensajeJson(
    "scan_request",
    status,
    context,
    payload
  );
  webSocket.sendTXT(mensaje);
}

void onScanConfirm(const char* status, const char* context, JsonObject payload){
  String mensaje = crearMensajeJson(
    "scan_confirm",
    status,
    context,
    payload
  );
  webSocket.sendTXT(mensaje);
}

void onScanDone(const char* status, const char* context, JsonObject payload){
  String mensaje = crearMensajeJson(
    "scan_done",
    status,
    context,
    payload
  );
  webSocket.sendTXT(mensaje);
}

void payloadsEvents(uint8_t * payload){
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
        Serial.println("[Acción] Iniciando escaneo...");
        getFingerprintEnroll(fingerID, contexto, payloadObj);
        downloadFingerprintTemplate(fingerID, contexto, payloadObj);
  }
}


void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
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

  // Conectar a Wi-Fi
  Serial.println();
  Serial.printf("Conectando a %s...\n", ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n[WiFi] Conectado con IP: ");
  Serial.println(WiFi.localIP());

  // Inicializar WebSocket
  webSocket.begin(host, port, path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);

    //Conectar sensor
  while (!Serial);
  Serial.println("Extractor de Huella dactilar");
  mySerial.begin(57600, SERIAL_8N1, 16, 17);  // RX, TX
  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("Existe el sensor!");
  } else {
    Serial.println("Sensor no detectado. Reintentando...");
    delay(5000);
    ESP.restart();
  }
}

void loop() {
  webSocket.loop(); // Procesar eventos WebSocket
}

uint8_t downloadFingerprintTemplate(int id, const char* context, JsonObject payload)
{
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

  // OK success!

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

  // one data packet is 267 bytes. in one data packet, 11 bytes are 'usesless' :D
  uint8_t bytesReceived[534]; // 2 data packets
  memset(bytesReceived, 0xff, 534);

  uint32_t starttime = millis();
  int i = 0;
  while (i < 534 && (millis() - starttime) < 20000) {
    if (mySerial.available()) {
      bytesReceived[i++] = mySerial.read();
    }
  }
  Serial.print(i); Serial.println(" bytes read.");
  Serial.println("Decoding packet...");

  uint8_t fingerTemplate[512]; // the real template
  memset(fingerTemplate, 0xff, 512);

  // filtering only the data packets
  int uindx = 9, index = 0;
  memcpy(fingerTemplate + index, bytesReceived + uindx, 256);   // first 256 bytes
  uindx += 256;       // skip data
  uindx += 2;         // skip checksum
  uindx += 9;         // skip next header
  index += 256;       // advance pointer
  memcpy(fingerTemplate + index, bytesReceived + uindx, 256);   // second 256 bytes

  
  String templateHex = printHexString(fingerTemplate, 512, 2);
  Serial.println(templateHex);
  Serial.println("\ndone.");
  payload["fingerprint_data"] = templateHex;
  onScanDone("success", context, payload);

  return p;
}

String printHexString(uint8_t* data, size_t len, int precision) {
  String hexStr = "";
  char tmp[16];
  char format[10];
  sprintf(format, "%%0%dX", precision);  // Ej: "%02X"

  for (size_t i = 0; i < len; ++i) {
    sprintf(tmp, format, data[i]);
    hexStr += tmp;
  }

  return hexStr;
}


uint8_t getFingerprintEnroll(int id, const char* context, JsonObject payload) {
  int p = -1;
  Serial.print("Waiting for valid finger to enroll as #"); Serial.println(id);
  while (finger.getImage() != FINGERPRINT_NOFINGER) {
    Serial.print(".");
    delay(100);  // Evita lecturas excesivas
  }
    p = finger.getImage();
    switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image taken"); //✅
      break;
    case FINGERPRINT_NOFINGER:
      Serial.print(".");
      break;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("GetImage Communication error");
      onScanRequest("error", context, makePayloadMessage("GetImage Communication error"));//❌
      break;
    case FINGERPRINT_IMAGEFAIL:
      Serial.println("Imaging error");
      onScanRequest("error", context, makePayloadMessage("Imaging error"));//❌
      break;
    default:
      Serial.println("Unknown error");
      onScanRequest("error", context, makePayloadMessage("Unknown error"));//❌
      break;
    }
  // OK success!
  p = finger.image2Tz(1);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      onScanRequest("success", context, payload);//✅💬
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Converted Communication error");
      onScanRequest("error", context, makePayloadMessage("Converted Communication error"));//❌
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      onScanRequest("error", context, makePayloadMessage("Communication error"));//❌
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      onScanRequest("error", context, makePayloadMessage("Could not find fingerprint features"));//❌
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      onScanRequest("error", context, makePayloadMessage("Could not find fingerprint features"));//❌
      return p;
    default:
      Serial.println("Unknown error");
      onScanRequest("error", context, makePayloadMessage("Unknown error"));//❌
      return p;
  }

  Serial.println("Remove finger");

  onScanConfirm("info", context, payload);//💬💬💬💬💬

  delay(500);//modifiend 2000 to 500
  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }
  Serial.print("ID "); Serial.println(id);
  p = -1;
  Serial.println("Place same finger again");
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image taken");//✅
      break;
    case FINGERPRINT_NOFINGER:
      Serial.print(".");
      break;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Remove Finger Communication error");
      onScanConfirm("error", context, makePayloadMessage("Remove Finger Communication error"));//❌
      break;
    case FINGERPRINT_IMAGEFAIL:
      Serial.println("Imaging error");
      onScanConfirm("error", context, makePayloadMessage("Imaging error"));//❌
      break;
    default:
      Serial.println("Unknown error");
      onScanConfirm("error", context, makePayloadMessage("Unknown error"));//❌
      break;
    }
  }

  // OK success!

  p = finger.image2Tz(2);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");//✅
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      onScanConfirm("error", context, makePayloadMessage("Image too messy"));//❌
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Again Converted Communication error");
      onScanConfirm("error", context, makePayloadMessage("Again Converted Communication error"));//❌
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      onScanConfirm("error", context, makePayloadMessage("Could not find fingerprint features"));//❌
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      onScanConfirm("error", context, makePayloadMessage("Could not find fingerprint features"));//❌
      return p;
    default:
      Serial.println("Unknown error");
      onScanConfirm("error", context, makePayloadMessage("Unknown error"));//❌
      return p;
  }

  // OK converted!
  Serial.print("Creating model for #");  Serial.println(id);

  p = finger.createModel();
  if (p == FINGERPRINT_OK) {
    Serial.println("Prints matched!");//✅
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Creating model Communication error");
    onScanConfirm("error", context, makePayloadMessage("Creating model Communication error"));//❌
    return p;
  } else if (p == FINGERPRINT_ENROLLMISMATCH) {
    Serial.println("Fingerprints did not match");
    onScanConfirm("error", context, makePayloadMessage("Fingerprints did not match"));//❌
    return p;
  } else {
    Serial.println("Unknown error");
    onScanConfirm("error", context, makePayloadMessage("Unknown error"));//❌
    return p;
  }

  Serial.print("ID "); Serial.println(id);
  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("Stored!");
    onScanConfirm("success", context, payload);//✅💬
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Store Communication error");
    onScanConfirm("error", context, makePayloadMessage("Store Communication error"));//❌
    return p;
  } else if (p == FINGERPRINT_BADLOCATION) {
    Serial.println("Store Location error");
    onScanConfirm("error", context, makePayloadMessage("Store Location error"));//❌
    return p;
  } else if (p == FINGERPRINT_FLASHERR) {
    Serial.println("Error writing to flash");
    onScanConfirm("error", context, makePayloadMessage("Error writing to flash"));//❌
    return p;
  } else {
    Serial.println("Unknown error");
    onScanConfirm("error", context, makePayloadMessage("Unknown error"));//❌
    return p;
  }

  return true;
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





