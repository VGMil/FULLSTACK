#include <WiFi.h>
#include <ESPAsyncWebServer.h>

const char* ssid = "VGIsaac";
const char* password = "isaito12";

AsyncWebServer server(80);

// LED GPIO
const int LED_READY = 2;

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO desde ESP32</title>
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
  <h1>Conectado a Socket.IO</h1>
  <div id="estado">Estado actual: esperando...</div>

<script>
  const socket = io("http://192.168.0.110:3001/estados"); // IP del servidor Node.js

  socket.on("connect", () => {
    console.log("Conectado al servidor Socket.IO");
  });

  socket.on("state_update", (estado) => {
    document.getElementById("estado").innerText = "Estado actual: " + estado;
    fetch(`/estado?valor=${estado}`);
  });
</script>

</body>
</html>
)rawliteral";

void setup() {
  Serial.begin(115200);

  pinMode(LED_READY, OUTPUT);
  digitalWrite(LED_READY, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado");
  Serial.println("IP del ESP32: " + WiFi.localIP().toString()); // Muestra la IP asignada

  // Servir la página HTML en la raíz "/"
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });

  // Ruta para recibir el estado desde la página HTML
  server.on("/estado", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("valor")) {
      String estado = request->getParam("valor")->value();
      Serial.println("Estado recibido: " + estado);

      if (estado == "scan_request") {
        digitalWrite(LED_READY, HIGH); // Prender el LED si el estado es "ready_scan"
      } else {
        digitalWrite(LED_READY, LOW); // Apagar el LED en otros estados
      }
    }
    request->send(200, "text/plain", "OK");
  });

  server.begin();
}

void loop() {
  // No hay lógica en el loop, todo es manejado por eventos
}
