# BaDa IOTs KZ Demo

Connect Raspberry Pi3 to Arduino Uno via serial port

	// Code for Arduino Uno "arduino_uno/*.ino"

On Raspberry Pi 3, run:

  ```bash
  git clone https://github.com/BonsoirDiep/bada-on-ras.git
  npm install
  ```
Get adress A of  connect via serial-port:
```bash
  npm run test
```
Replace A in "index.js" as variable "portName"
```bash
  npm start
```
***
Design [here](https://badaiots-kz.herokuapp.com/nguoidung/thietke.html)

Note:
```text
id [ 3, 5, 6, 9, 10, 11] -> node with type ao
id [ 2, 4, 7, 8, 12, 13] -> node with type do
id [ 14, 15, 16, 17, 18, 19] -> node with type ai
```