FROM alpine:3.18

EXPOSE 8080

COPY main /

ENTRYPOINT [ "/main" ]