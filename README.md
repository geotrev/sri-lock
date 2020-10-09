# SRI Lock

A CLI tool to help manage your CDN link tags in any file.

It only works with Node 14, but will support 10+ in the future.

## What does it do?

This tool does two main things:

1. Keeps and updates SRI hashes in a local "lock" file, from either local files or npm modules.
2. Uses your lock file to search for and update files which have CDN `script` links in them.
