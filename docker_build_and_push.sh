#!/usr/bin/env bash

docker build -t neoformit/ena-upload:v1.0 . && docker push neoformit/ena-upload:v1.0
