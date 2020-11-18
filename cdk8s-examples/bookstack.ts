import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';
import * as kplus from 'cdk8s-plus';

export class BookstackChart extends Chart {

  constructor(scope: Construct, name: string) {
    super(scope, name);
    const ingress = new kplus.Ingress(this, 'ingress');
    ingress.addHostDefaultBackend('bookstack.lan', this.getIngressBackend());
  }

  private static getContainer() {
    const container = new kplus.Container( {
      image: 'linuxserver/bookstack',
      imagePullPolicy: kplus.ImagePullPolicy.ALWAYS,
      port: 80,
      volumeMounts:[{
        path: '/config',
        volume: kplus.Volume.fromEmptyDir('config'),
      }]
    });

    container.addEnv('PUID', kplus.EnvValue.fromValue('1000'));
    container.addEnv('PGID', kplus.EnvValue.fromValue('1000'));
    container.addEnv('TZ',   kplus.EnvValue.fromValue('America/New_York'));
    container.addEnv('APP_URL', kplus.EnvValue.fromValue('http://bookstack.lan'));
    container.addEnv('DB_HOST', kplus.EnvValue.fromValue('mariadb'));
    container.addEnv('DB_USER', kplus.EnvValue.fromValue('root'));
    container.addEnv('DB_PASS',   kplus.EnvValue.fromValue('password'));
    container.addEnv('DB_DATABASE',   kplus.EnvValue.fromValue('bookstackapp'));

    return container;
  }

  private getDeployment() {
    return new kplus.Deployment(this, 'deployment', {
      containers: [ BookstackChart.getContainer() ]
    });
  }

  private getIngressBackend() {
    return kplus.IngressBackend.fromService(this.getDeployment().expose(80));
  }

}

const app = new App();
new BookstackChart(app, 'bookstack');
app.synth();
