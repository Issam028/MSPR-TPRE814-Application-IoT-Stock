import argparse
import json
import time
import urllib.error
import urllib.request

import serial


DEFAULT_PORT = "COM5"
DEFAULT_BAUD = 115200
DEFAULT_API_URL = "http://localhost:3000/mesures"


def post_payload(api_url, payload):
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        api_url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=10) as response:
        response_body = response.read().decode("utf-8", errors="replace")
        return response.status, response_body


def main():
    parser = argparse.ArgumentParser(description="Forward ESP32 DHT11 serial JSON to FutureKawa API.")
    parser.add_argument("--port", default=DEFAULT_PORT)
    parser.add_argument("--baud", default=DEFAULT_BAUD, type=int)
    parser.add_argument("--api-url", default=DEFAULT_API_URL)
    args = parser.parse_args()

    print("ESP32 serial bridge")
    print("Port:", args.port)
    print("Baud:", args.baud)
    print("API:", args.api_url)

    with serial.Serial(args.port, args.baud, timeout=2) as connection:
        time.sleep(2)
        connection.reset_input_buffer()

        while True:
            raw_line = connection.readline().decode("utf-8", errors="replace").strip()
            if not raw_line:
                continue

            print("serial:", raw_line)

            if not raw_line.startswith("{"):
                continue

            try:
                payload = json.loads(raw_line)
                status, response_body = post_payload(args.api_url, payload)
                print("posted:", status, response_body)
            except (json.JSONDecodeError, urllib.error.URLError, TimeoutError) as error:
                print("bridge error:", error)


if __name__ == "__main__":
    main()
