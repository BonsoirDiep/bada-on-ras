// BaDa Software
// Code for Arduino Uno
// connect Raspberry 3 via serial port
// Diep Nguyen - MTA

#include <SerialCommand.h>

SerialCommand sCmd;     // The demo SerialCommand object

int count;
int sensor[5];
void setup() {
  //var pins = [ 2, 4, 7, 8, 12, 13];
  pinMode(2, OUTPUT);
  pinMode(4, OUTPUT);
  pinMode(7, OUTPUT);
  pinMode(8, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);

  Serial.begin(9600);

  // Setup callbacks for SerialCommand commands
  sCmd.addCommand("ao", ao_fc);
  sCmd.addCommand("ai", ai_fc);
  sCmd.addCommand("do", do_fc);
  sCmd.addCommand("check", check_fc);
  sCmd.setDefaultHandler(unrecognized); // Handler for command that isn't matched  (says "What?")
  Serial.println("Ready");
}

void loop() {
  sCmd.readSerial();
  check_fc();
  delay(500);
}

void check_fc() {
  int i;
  for(i = 0;i<5;i++){
    if(sensor[i]>0){
      Serial.print("{\"node");
      Serial.print(sensor[i]);
      Serial.print("\":");
	  
      //Serial.print(random(23, 32));
	  int reading = analogRead(sensor[i]);
      float voltage = reading * 5.0 / 1024.0;
      // float tempC = voltage * 100.0;
      Serial.print(voltage);
	  
      Serial.println("}");
      delay(90);
    }
  }
}

void do_fc() {
  char *arg;
  int aNumber;
  arg = sCmd.next();
  if (arg != NULL) {
    aNumber = atol(arg);
    if(aNumber>0){
      arg = sCmd.next();
      if (arg != NULL) {
        int value = atol(arg);
        if(value==1) digitalWrite(aNumber, HIGH);
        else digitalWrite(aNumber, LOW);
      }
    }
  }
}

void ao_fc() {
  char *arg;
  int aNumber;
  arg = sCmd.next();
  if (arg != NULL) {
    aNumber = atol(arg);
    if(aNumber>0){
      arg = sCmd.next();
      if (arg != NULL) {
        int value = atol(arg);
        analogWrite(aNumber,value);
      }
    }
  }
}


void ai_fc() {
  count = 0;
  for(count = 0;count<5;count++){
    sensor[count] = 0;
  }
  count = 0;
  int aNumber;
  char *arg;
  arg = sCmd.next();
  while(true){
    if (arg != NULL) {
      if(count>4) break;
      aNumber = atol(arg);
      if(aNumber>0){
        sensor[count] = aNumber;
      }
      count++;
      arg = sCmd.next();
    }
    else {
      break;
    }
  }
  check_fc();
}

// This gets set as the default handler, and gets called when no other command matches.
void unrecognized(const char *command) {
  Serial.println("{\"err\":\"unknown command\"}");
}
