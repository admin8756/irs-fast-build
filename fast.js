/**
 * @name 自动打包工具
 * !!! 运行前请先安装依赖 yarn || npm i
 * TODO ：其他项目·先运行 yarn add adm-zip-D || npm install adm-zip -D
 * @description: 打包工具
 * @example: node fast.js
 * @version: 1.0.0
 * @date: 2023-02-02
 * @param {string} path1 dist/build/h5
 * @param {string} path2 fast-pack
 * @param {string} path3 dist
 * TODO: 工作流程
 * ??? 0. 运行打包命令，等待打包完成
 * ??? 1. 删除fast-pack目录
 * ??? 2. 创建fast-pack目录
 * ??? 3. 判断dist/build/h5目录是否存在
 * ??? 4. 判断fast-pack是否有写入权限
 * ??? 5. 拷贝dist目录下的h5目录到fast-pack目录下
 * ??? 6. 创建package.json
 * ??? 7. 执行zip命令打包
 * ??? 8. 打包完成
 * @return {string} 打包完成
 */
// TODO : 请在.gitignore添加以下内容

// /fast-pack
// fast-pack.zip

const path = require("path");
const fs = require("fs");
var AdmZip = require("adm-zip");
const { exec } = require("child_process");

// TODO: 这里替换成你的打包命令
const command = "yarn build:h5";
// TODO: 这里替换成你的打包后的目录
const path1 = "./dist/build/h5";

const path2 = "./fast-pack";
const path3 = "/dist";

const log = (msg) => console.log("[FAST-PACK]-LOG:", msg);

const copyDir = async (src, dist) => {
  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const filePath = path.join(src, file);
    const targetPath = path.join(dist, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      fs.copyFileSync(filePath, targetPath);
    } else if (stats.isDirectory()) {
      fs.mkdirSync(targetPath);
      // 递归复制
      copyDir(filePath, targetPath);
    }
  });
};
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
};

const build = async () => {
  log("开始编译");
  await execCommand(command);
  log("编译完成");
};

const zip = async () => {
  log("开始打包");
  const zip = new AdmZip();
  zip.addLocalFolder("./fast-pack");
  zip.writeZip("./fast-pack.zip");
  log("清理临时文件");
};

const move = async () => {
  log("判断dist目录是否存在");
  if (!fs.existsSync("./dist")) {
    return log("dist目录不存在");
  }
  log(`判断${path1}目录是否存在`);
  if (!fs.existsSync(path1)) {
    return log(`${path1}目录不存在`);
  }
  log("判断是否有复制权限");
  try {
    fs.accessSync(path1, fs.constants.R_OK);
    log(`${path1}目录有读取权限`);
  } catch (err) {
    return log(`${path1}目录没有读取权限`);
  }
  log("判断fast-pack目录是否有写入权限");
  try {
    fs.accessSync(path2, fs.constants.W_OK);
    log("fast-pack目录有写入权限");
  } catch (err) {
    return log("fast-pack目录没有写入权限");
  }
  log("开始复制文件");
  // 创建path2 + path3目录
  fs.mkdirSync(path2 + path3);
  await copyDir(path1, path2 + path3);
  log("复制文件完成");
};

const addPackage = async () => {
  log("创建package.json");
  const packageJson = {
    name: "fast-build",
    version: "1.0.0",
    main: "index.js",
    license: "MIT",
    scripts: {
      build: "mkdir build;mv ./dist/* ./build",
    },
  };
  fs.writeFileSync("./fast-pack/package.json", JSON.stringify(packageJson));
  log("创建package.json完成");
};

const start = async () => {
  // 编译
  await build();
  // 初始化
  await init();
  // 移动文件
  await move();
  // 添加package.json
  await addPackage();
  // 打包
  await zip();
  fs.rmSync("./fast-pack", { recursive: true });
  log("Success! 执行结束打包成功");
};

const init = async () => {
  if (fs.existsSync(path2)) {
    log("删除已存在文件夹");
    fs.rmSync(path2, { recursive: true });
  }
  if (fs.existsSync("./fast-pack.zip")) {
    log("清理旧的打包");
    fs.rmSync("./fast-pack.zip");
  }
  log("创建目录");
  fs.mkdirSync(path2);
};
start();
