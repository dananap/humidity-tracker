#include <chrono> // std::chrono::seconds
#include <cstdint>
#include <ctime>
#include <exception>
#include <fcntl.h>  //Needed for I2C port
#include <iomanip>  // std::chrono::seconds
#include <iostream> // std::cout, std::endl
#include <iterator>
#include <linux/i2c-dev.h> //Needed for I2C port
#include <sys/ioctl.h>     //Needed for I2C port
#include <thread>          // std::this_thread::sleep_for
#include <tuple>
#include <unistd.h> //Needed for I2C port
#include <utility>

std::tuple<double, double> getResult() {
  int file_i2c;
  int length;
  unsigned char buffer[8] = {0};

  //----- OPEN THE I2C BUS -----
  char *filename = (char *)"/dev/i2c-1";
  if ((file_i2c = open(filename, O_RDWR)) < 0) {
    // ERROR HANDLING: you can check errno to see what went wrong
    printf("Failed to open the i2c bus");
    std::terminate();
  }

  int addr = 0x5c; //<<<<<The I2C address of the slave
  if (ioctl(file_i2c, I2C_SLAVE, addr) < 0) {
    printf("Failed to acquire bus access and/or talk to slave.\n");
    // ERROR HANDLING; you can check errno to see what went wrong
    std::terminate();
  }
  write(file_i2c, buffer, 1);
  std::this_thread::sleep_for(std::chrono::microseconds(801));

  //----- WRITE BYTES -----
  buffer[0] = 0x03;
  buffer[1] = 0x00;
  buffer[2] = 0x04;
  length = 3; //<<< Number of bytes to write
  if (write(file_i2c, buffer, length) !=
      length) // write() returns the number of bytes actually written, if it
              // doesn't match then an error occurred (e.g. no response from the
              // device)
  {
    /* ERROR HANDLING: i2c transaction failed */
    std::cerr << "Failed to write to the i2c bus.\n";
    std::terminate();
  }

  std::this_thread::sleep_for(std::chrono::microseconds(1501));

  //----- READ BYTES -----
  length = 8; //<<< Number of bytes to read
  if (read(file_i2c, buffer, length) !=
      length) // read() returns the number of bytes actually read, if it doesn't
              // match then an error occurred (e.g. no response from the device)
  {
    // ERROR HANDLING: i2c transaction failed
    printf("Failed to read from the i2c bus.\n");
    std::terminate();
  }
  if (buffer[0] != 0x03 || buffer[1] != 0x04) {
    std::cerr << "invalid response from the device\n";
    std::terminate();
  }

  const double humidity = (buffer[3] | buffer[2] << 8) / 10;
  const double temperature = (buffer[5] | buffer[4] << 8) / 10;

  std::tuple<double, double> res = std::make_tuple(temperature, humidity);

  return res;
}

int main(int argc, char *argv[]) {
  std::tuple<double, double> data = getResult();
  const auto ts = std::chrono::system_clock::now();

  std::cout << "{\"temperature\":" << std::setprecision(2) << std::get<0>(data)
            << ",\"humidity\":" << std::setprecision(2) << std::get<1>(data)
            << ",\"time\":"
            << std::chrono::duration_cast<std::chrono::seconds>(
                   ts.time_since_epoch())
                   .count()
            << "}";

  return 0;
}