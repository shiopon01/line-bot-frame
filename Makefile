all: compress
compress:
	mkdir zip
	cp botServer.js index.js
	zip -r zip/botServer.js.zip index.js
	rm index.js
	cp jobWorker.js index.js
	zip -r zip/jobWorker.js.zip index.js node_modules
	rm index.js

clean:
	rm -f zip/*
	rmdir zip

.PHONY: all clean