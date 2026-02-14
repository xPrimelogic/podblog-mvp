#!/bin/bash
# Script per leggere credenziali (richiede permessi adeguati)

SECRETS_FILE="/home/node/.openclaw-secrets"

if [ -r "$SECRETS_FILE" ]; then
    # File leggibile
    cat "$SECRETS_FILE"
else
    echo "⚠️ File non leggibile con permessi correnti"
    echo "Provare con: sudo cat $SECRETS_FILE"
    exit 1
fi
