package main

import (
	"embed"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
)

//go:embed dist/*
var content embed.FS

func handleStaticFiles(w http.ResponseWriter, r *http.Request) {
	// Use the URL path to construct the file path within the embedded FS
	filePath := r.URL.Path[1:] // Remove the leading slash
	data, err := content.ReadFile("dist/" + filePath)
	if err != nil {
		// If the file is not found, serve index.html
		data, err = content.ReadFile("dist/index.html")
		if err != nil {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}
	}

	// Set the appropriate content type based on the file extension
	contentType := http.DetectContentType(data)
	w.Header().Set("Content-Type", contentType)

	// Write the file data to the response
	w.Write(data)
}

func handleProxy(w http.ResponseWriter, r *http.Request) {
	// Get the "url" parameter from the request query
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		http.Error(w, "Missing 'url' parameter", http.StatusBadRequest)
		return
	}

	// Parse the target URL
	target, err := url.Parse(targetURL)
	if err != nil {
		http.Error(w, "Invalid 'url' parameter", http.StatusBadRequest)
		return
	}

	// Create a new request to the target URL
	req, err := http.NewRequest(r.Method, target.String(), r.Body)
	if err != nil {
		http.Error(w, "Failed to create new request", http.StatusInternalServerError)
		return
	}

	// Parse the existing query parameters from the target URL
	existingQueryParams, _ := url.ParseQuery(target.RawQuery)

	// Add all query parameters from the proxy request (except "url") to the new request
	for key, values := range r.URL.Query() {
		if key != "url" {
			for _, value := range values {
				existingQueryParams.Add(key, value)
			}
		}
	}

	// Combine the existing and new query parameters and set them back to the target URL
	target.RawQuery = existingQueryParams.Encode()

	// Update the request URL to the modified target URL
	req.URL = target

	// Perform the request to the target URL
	client := http.DefaultClient
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to perform request to target URL", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy response headers from the target to the original response
	for key, values := range resp.Header {
		for _, value := range values {
			if key != "Set-Cookie" { // Skip the "Set-Cookie" header
				w.Header().Add(key, value)
			}
		}
	}

	// Set CORS headers to allow cross-origin requests from any domain
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Copy the response status code
	w.WriteHeader(resp.StatusCode)

	// Copy the response body to the original response
	io.Copy(w, resp.Body)
}

func main() {
	// Set up the HTTP server and route requests to the appropriate handlers
	http.HandleFunc("/proxy", handleProxy)
	http.HandleFunc("/", handleStaticFiles)

	// Start the server on port 8080
	fmt.Println("XNews server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
