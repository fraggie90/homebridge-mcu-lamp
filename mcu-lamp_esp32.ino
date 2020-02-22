
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <WiFiClient.h>

WebServer server;

char* ssid = "ssidhere";
char* password = "passhere";

const int relay = 2; // led on esp32
int curstate = 0;

MDNSResponder mdns;

void setup()
{
  pinMode(relay, OUTPUT);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid,password);
  Serial.begin(115200);
  while(WiFi.status()!=WL_CONNECTED)
  {
    Serial.print(".");
    delay(500);
  }
  Serial.println("");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esp32"))
    Serial.println("MDNS responder started");

  server.on("/led1/status", handle_state);
  server.on("/led1/relay", handle_relay);
  server.begin();

  MDNS.addService("http", "tcp", 80);
}

void loop()
{
  server.handleClient();
//  digitalWrite(relay, state); // Set relay state
  
}

void handle_state() {
  server.send(200, "text/plain", ((curstate)?"1":"0"));
}

void handle_relay() {
  // get the value of request argument "state" and convert it to an int
  int state = server.arg("state").toInt();

  curstate = state; // Set the current state
  digitalWrite(relay, state); // Set relay state
  server.send(200, "text/plain",  ((state)?"1":"0")); // Return True / False
}
  
