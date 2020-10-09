# Paopu

A CLI tool to help manage your CDN link tags in any file.

It only works with Node 14, but will support 10+ in the future.

## What does it do?

This tool does two main things:

1. Reads from local files and stores SHA256 hashes.
2. Uses your lock file to search for and update files which have CDN `script` links in them.
