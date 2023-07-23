.PHONY: build
build:
	npm run build:web
	rm -r dist/assets
	CGO_ENABLED=0 go build main.go 
	docker build -t kweijack/xnews:latest .
	docker push kweijack/xnews:latest