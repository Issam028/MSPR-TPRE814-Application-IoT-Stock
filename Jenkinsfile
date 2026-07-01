pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate Docker Compose') {
      steps {
        sh 'docker compose --profile dev config'
      }
    }

    stage('Build Country API') {
      steps {
        dir('country/api') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Build Central API') {
      steps {
        dir('central/api') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('central/app') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Build MQTT Bridge Image') {
      steps {
        sh 'docker compose --profile dev build mqtt_bridge'
      }
    }
  }

  post {
    success {
      echo 'FutureKawa CI pipeline completed successfully.'
    }
    failure {
      echo 'FutureKawa CI pipeline failed. Check the failing stage logs.'
    }
  }
}
