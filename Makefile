all: compress
compress:
	rm -f zip/*.zip
	cd src/botServer; zip    ../../zip/botServer.js.zip *.js
	cd src/jobWorker;	zip -r ../../zip/jobWorker.js.zip *.js node_modules reply

clean:
	rm -f zip/*.zip

.PHONY: all clean