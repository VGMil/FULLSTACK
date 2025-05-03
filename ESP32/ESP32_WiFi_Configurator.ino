#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <ArduinoJson.h>
#include <SocketIoClient.h>

AsyncWebServer server(80);
SocketIoClient socketIO;

bool apMode = true;
String ssidSTA = "";
String passwordSTA = "";

const char* apSSID = "ESP32_Configurator";
const char* apPassword = "config1234";

void setup() {
  Serial.begin(115200);
  
  // Iniciar modo AP
  WiFi.softAP(apSSID, apPassword);
  Serial.println("Modo AP iniciado");
  Serial.print("IP AP: ");
  Serial.println(WiFi.softAPIP());

  // Configurar servidor web
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", htmlIndex);
  });

  server.on("/scan", HTTP_GET, [](AsyncWebServerRequest *request){
    DynamicJsonDocument doc(1024);
    JsonArray networks = doc.createNestedArray("networks");
    
    int n = WiFi.scanNetworks();
    for(int i=0; i<n; i++){
      JsonObject network = networks.createNestedObject();
      network["ssid"] = WiFi.SSID(i);
      network["rssi"] = WiFi.RSSI(i);
      network["encryption"] = (WiFi.encryptionType(i) == WIFI_AUTH_OPEN) ? "Abierta" : "Protegida";
    }
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });

  server.on("/connect", HTTP_POST, [](AsyncWebServerRequest *request){
    if(request->hasParam("ssid", true) && request->hasParam("password", true)){
      ssidSTA = request->getParam("ssid", true)->value();
      passwordSTA = request->getParam("password", true)->value();
      
      request->send(200, "text/plain", "Intentando conexión...");
      apMode = false;
    } else {
      request->send(400, "text/plain", "Datos incompletos");
    }
  });

  server.begin();
}

void loop() {
  if(!apMode){
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssidSTA.c_str(), passwordSTA.c_str());
    
    int intentos = 0;
    while(WiFi.status() != WL_CONNECTED && intentos < 10){
      delay(500);
      Serial.print(".");
      intentos++;
    }

    if(WiFi.status() == WL_CONNECTED){
      Serial.println("\nConectado a WiFi!");
      Serial.print("IP STA: ");
      Serial.println(WiFi.localIP());
      
      // Conectar a Socket.IO
      socketIO.begin("192.168.100.68", 3001);
      socketIO.on("message", [](const char* data, size_t len){
        Serial.printf("Mensaje recibido: %s\n", data);
      });
      
      // Cerrar AP
      WiFi.softAPdisconnect(true);
      server.end();
    } else {
      Serial.println("\nError de conexión, reiniciando...");
      ESP.restart();
    }
    apMode = true;
  }
  
  if(!apMode){
    socketIO.loop();
  }
}

const char* htmlIndex = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Configuración WiFi</title>
  <style>
    body {font-family: Arial; margin: 20px;}
    .network-list {margin: 20px 0;}
    .network-item {
      padding: 10px;
      margin: 5px 0;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>Configurar Conexión WiFi</h1>
  <div class="network-list" id="networks">
    <p>Buscando redes...</p>
  </div>
  
  <form id="wifiForm">
    <input type="hidden" id="selectedSSID">
    <div>
      <label>Contraseña:</label>
      <input type="password" id="password" required>
    </div>
    <button type="submit">Conectar</button>
  </form>

  <script>
    fetch('/scan')
      .then(response => response.json())
      .then(data => {
        const networksDiv = document.getElementById('networks');
        networksDiv.innerHTML = '';
        
        data.networks.forEach(network => {
          const div = document.createElement('div');
          div.className = 'network-item';
          div.innerHTML = `
            <input type="radio" name="ssid" value="${network.ssid}">
            ${network.ssid} (${network.rssi} dBm) - ${network.encryption}
          `;
          div.querySelector('input').addEventListener('click', () => {
            document.getElementById('selectedSSID').value = network.ssid;
          });
          networksDiv.appendChild(div);
        });
      });

    document.getElementById('wifiForm').addEventListener('submit', e => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('ssid', document.getElementById('selectedSSID').value);
      formData.append('password', document.getElementById('password').value);
      
      fetch('/connect', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if(response.ok) {
          alert('Conectando... Reiniciando dispositivo');
        }
      });
    });
  </script>
</body>
</html>
)rawliteral";