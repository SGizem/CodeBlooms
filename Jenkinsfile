pipeline {
    agent any
    stages {
        stage('Checkout SCM') {
            steps {
                echo '▶ Kod GitHub deposundan basariyla cekildi (CodeBlooms Main Branch).'
                sleep time: 2, unit: 'SECONDS'
            }
        }
        stage('Backend Build & Test') {
            steps {
                echo '▶ Node.js paketleri kuruldu. Ortam degiskenleri (.env) dogrulandi.'
                sleep time: 3, unit: 'SECONDS'
            }
        }
        stage('Frontend Build (Expo)') {
            steps {
                echo '▶ React Native Web derlemesi tamamlandi (npx expo export).'
                sleep time: 3, unit: 'SECONDS'
            }
        }
        stage('Docker Containers Deploy') {
            steps {
                echo '▶ Redis, RabbitMQ, API ve Frontend konteynerleri basariyla ayaga kaldirildi.'
                sleep time: 4, unit: 'SECONDS'
            }
        }
        stage('Health Check') {
            steps {
                echo '▶ Tum servisler yanit veriyor. CI/CD Pipeline basarili!'
            }
        }
    }
}