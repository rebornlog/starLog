#!/bin/bash
# 限制 /dev/shm/ 执行权限
sudo mount -o remount,noexec,nosuid /dev/shm 2>/dev/null || true
chmod 1777 /dev/shm 2>/dev/null || true
