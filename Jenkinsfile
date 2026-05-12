pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                echo '✅ Kod GitHub dan basariyla alindi'
            }
        }
        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    echo '✅ Backend paketleri kuruldu'
                }
            }
        }
        stage('Frontend Build (Expo Web)') {
            steps {
                dir('codeblooms-mobile') {
                    sh 'npm install'
                    sh 'npx expo export -p web'
                    echo '✅ Frontend web derlemesi tamamlandi'
                }
            }
        }
        stage('Docker Deploy') {
            steps {
                echo '🚀 Docker konteynerleri ayaga kaldiriliyor...'
                sh 'docker-compose up -d --build'
            }
        }
    }
}