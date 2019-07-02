var path = require('path');
var fs = require('fs');
const chalk = require('chalk');
var dockerCLI = require('docker-cli-js');
var Docker = dockerCLI.Docker;

let docker = new Docker();
const DELETE_LOCAL_DOCKER_IMAGE_OVER_DAYS = 7;

fs.readFile(path.join(__dirname, 'nci.json'), { encoding: 'utf-8' }, (err, res) => {
  if(err) {
    console.log(chalk.red.bold(`${err.message}`));
    return err;
  }
  const { dockerHost, dockerGroup, appName, deletLocalImageOverDays } = JSON.parse(res);
  const imageName = `${dockerHost}/${dockerGroup}/${appName}`;
  const DELETE_LOCAL_DOCKER_IMAGE_TIMES =
    (deletLocalImageOverDays || DELETE_LOCAL_DOCKER_IMAGE_OVER_DAYS) * 24 * 60 * 60 * 1000;

  docker.command(`images ${imageName}`).then(data => {
    const images = data.images || [];
    if (!images.length) {
      console.log(chalk.green(`未发现name为【${imageName}】的本地镜像.`));
    }
    images.forEach(image => {
      const { tag } = image;
      const imageWithTag = `${imageName}:${tag}`;
      docker.command(`inspect ${imageWithTag}`).then(data => {
        const detailArr = data.object || [];
        const now = new Date();
        detailArr.forEach(detail => {
          const {
            RepoTags: [tagNamed = ''],
            Created = now
          } = detail;

          if (tagNamed === imageWithTag && now - new Date(Created) >= DELETE_LOCAL_DOCKER_IMAGE_TIMES) {
            docker.command(`rmi -f ${imageWithTag}`).then(data => {
              let rows = data.raw;
              if (!rows) {
                console.log(chalk.red(`删除镜像. 未找到本地镜像: ${imageWithTag}`));
              } else {
                rows.split('\n').forEach(row => console.log(`${row}`));
                console.log(chalk.green.bold(`本地镜像${imageWithTag}已删除!`));
              }
            });
          }
        });
      });
    });
  });
});
