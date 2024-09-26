pipeline {
    agent any

    stages {
        stage('SonarQube Analysis') {
           when {
                branch 'develop';
            }

            steps {
                withSonarQubeEnv('SonarQube') {
                script {
                    def scannerHome = tool 'SonarScanner';
                    sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }
    }
}