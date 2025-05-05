#include <WiFi.h>
#include <WebSocketsClient.h>

// Configuración Wi-Fi
const char* ssid     = "VGIsaac";
const char* password = "isaito12";

const char* host = "192.168.0.106";
const uint16_t port = 3001;
const char* path = "/estados"; 

WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WebSocket] Desconectado");
      break;
    case WStype_CONNECTED:
      Serial.println("[WebSocket] Conectado al servidor");
      break;
    case WStype_TEXT:
      Serial.printf("[WebSocket] Mensaje recibido: %s\n", payload);
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
  webSocket.begin(host, port, path);  // Conecta a ws://host:port/path
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000); // Intentar reconexión cada 5s
}

void loop() {
  webSocket.loop(); // Procesar eventos WebSocket
}
