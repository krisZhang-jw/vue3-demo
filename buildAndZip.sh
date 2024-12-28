#!/bin/bash
# 运行 pnpm run build
echo "Starting build..."
pnpm run build

if [ $? -eq 0 ]; then
  echo "Build completed successfully!"

  # 确认构建目录是否存在
  if [ -d "dist" ]; then
    echo "Starting to create zip..."

    # 使用 zip 命令压缩 build 目录
    zip -r dist.zip dist/

    if [ $? -eq 0 ]; then
      echo "ZIP file created successfully: dist.zip"
    else
      echo "Failed to create ZIP file."
    fi
  else
    echo "Build directory not found, skipping ZIP creation."
  fi
else
  echo "Build failed. Skipping ZIP creation."
fi