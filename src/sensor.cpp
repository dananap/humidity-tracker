#include <unistd.h>        //Needed for I2C port
#include <fcntl.h>         //Needed for I2C port
#include <sys/ioctl.h>     //Needed for I2C port
#include <linux/i2c-dev.h> //Needed for I2C port
#include <iostream>        // std::cout, std::endl
#include <thread>          // std::this_thread::sleep_for
#include <chrono>          // std::chrono::seconds
#include <iomanip>         // std::chrono::seconds
#include <iterator>

int main(int argc, char *argv[])
{
    using std::cout;

    int file_i2c;
    int length;
    unsigned char buffer[8] = {0};

    //----- OPEN THE I2C BUS -----
    char *filename = (char *)"/dev/i2c-1";
    if ((file_i2c = open(filename, O_RDWR)) < 0)
    {
        // ERROR HANDLING: you can check errno to see what went wrong
        printf("Failed to open the i2c bus");
        return 1;
    }

    int addr = 0x5c; //<<<<<The I2C address of the slave
    if (ioctl(file_i2c, I2C_SLAVE, addr) < 0)
    {
        printf("Failed to acquire bus access and/or talk to slave.\n");
        // ERROR HANDLING; you can check errno to see what went wrong
        return 1;
    }
    write(file_i2c, buffer, 1);
    std::this_thread::sleep_for(std::chrono::microseconds(801));

    //----- WRITE BYTES -----
    buffer[0] = 0x03;
    buffer[1] = 0x00;
    buffer[2] = 0x04;
    length = 3;                                    //<<< Number of bytes to write
    if (write(file_i2c, buffer, length) != length) // write() returns the number of bytes actually written, if it doesn't match then an error occurred (e.g. no response from the device)
    {
        /* ERROR HANDLING: i2c transaction failed */
        printf("Failed to write to the i2c bus.\n");
    }

    std::this_thread::sleep_for(std::chrono::microseconds(1501));

    //----- READ BYTES -----
    length = 8;                                   //<<< Number of bytes to read
    if (read(file_i2c, buffer, length) != length) // read() returns the number of bytes actually read, if it doesn't match then an error occurred (e.g. no response from the device)
    {
        // ERROR HANDLING: i2c transaction failed
        printf("Failed to read from the i2c bus.\n");
    }
    else
    {
        if (buffer[0] != 0x03 || buffer[1] != 0x04)
        {
            std::cerr << "invalid response from the device\n";
            return 2;
        }

        const float humidity = (buffer[3] | buffer[2] << 8) / 10;
        const float temperature = (buffer[5] | buffer[4] << 8) / 10;

        // for (auto &el : buffer)
        //     std::cout << std::setfill('0') << std::setw(2) << std::hex << (0xff & (unsigned int)el);

        cout
            << "{\"temperature\":" << std::setprecision(2) << temperature
            << ",\"humidity\":" << std::setprecision(2) << humidity << "}";
    }

    return 0;
}
