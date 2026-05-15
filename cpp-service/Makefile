CXX = g++
CXXFLAGS = -std=c++17 -O3 -pthread

all: cpp-service

cpp-service: main.cpp Algorithms.cpp
	$(CXX) $(CXXFLAGS) -o cpp-service main.cpp Algorithms.cpp

clean:
	rm -f cpp-service
