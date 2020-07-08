import yargs from 'yargs';
import { Options } from '@alipay/remix-types';
export { default as logger } from './build/utils/output';
import { build } from './build';
import analytics from './analytics';
import getConfig from './getConfig';
import API from './API';

export default class RemixCLI {
  options?: Options;
  api?: API;

  run(args: any, callback?: yargs.ParseCallback) {
    this.options = getConfig();
    this.api = new API();
    const cli = this.initCLI();
    this.api.registerPlugins(this.options.plugins);
    this.api.extendCLI(cli);
    if (args.length === 0) {
      cli.showHelp();
    }
    return cli.parse(args, callback);
  }

  initCLI() {
    return yargs
      .scriptName('remix')
      .usage('Usage: $0 <command> [options]')
      .command<any>(
        'build',
        '编译项目',
        y => {
          y.option('watch', {
            describe: '监听文件变化',
            alias: 'w',
            type: 'boolean',
            default: false,
          })
            .option('target', {
              describe: '目标平台',
              alias: 't',
              type: 'string',
              default: 'ali',
            })
            .option('notify', {
              describe: '编译错误提醒',
              alias: 'n',
              type: 'boolean',
              default: false,
            })
            .option('port', {
              describe: '指定端口号',
              alias: 'p',
              type: 'number',
            })
            .option('analyze', {
              describe: '编译分析',
              alias: 'a',
              type: 'boolean',
              default: false,
            });
        },
        (argv: any) => {
          analytics.event('cli', 'build', argv.target).send();
          build({ ...this.options, ...argv }, this.api!);
        }
      )
      .help();
  }
}