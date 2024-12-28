#!/bin/bash

# 获取操作系统类型
OS_TYPE=$(uname)

# 获取当前脚本所在目录的路径
SCRIPT_DIR=$(dirname "$(realpath "$0")")

# 获取目录名称
DIR_NAME=$(basename "$SCRIPT_DIR")

DIR_NAME="dist"

# 运行 pnpm run build
echo "Starting build..."
npm i pnpm -g
pnpm run build

if [ $? -eq 0 ]; then
  echo "Build completed successfully!"

  # 确认构建目录是否存在
  if [ -d "dist" ]; then
    echo "Starting to create zip..."

    # 使用 zip 命令压缩 build 目录
    if [[ "$OS_TYPE" == "Darwin" ]]; then
        echo "当前系统是 macOS"
        zip -r $DIR_NAME.zip dist/
    elif [[ "$OS_TYPE" == "CYGWIN"* || "$OS_TYPE" == "MINGW"* ]]; then
        echo "当前系统是 Windows (通过 Cygwin 或 MinGW)"
        # Compress-Archive -Path dist/ -DestinationPath $DIR_NAME.zip
        # tar -czvf $DIR_NAME.tar.gz dist
        7z a $DIR_NAME.zip dist
    fi
    if [ $? -eq 0 ]; then
      echo "ZIP file created successfully: $DIR_NAME.zip"
    else
      echo "Failed to create ZIP file."
    fi
  else
    echo "Build directory not found, skipping ZIP creation."
  fi
else
  echo "Build failed. Skipping ZIP creation."
fi

read -p "Press any key to exit..."
