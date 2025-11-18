import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  try {
   
    const dataSource = app.get('DataSource');
    const userRepository = dataSource.getRepository('User');
    
    const email = 'luis.riveralopez@ucr.ac.cr';
    const password = '***REMOVED***';
    
    console.log(' Buscando usuario...');
    const user = await userRepository.findOne({ where: { uEmail: email } });
    
    if (!user) {
      console.log(' Usuario NO encontrado');
      await app.close();
      return;
    }
    
    console.log(' Usuario encontrado:', user.uEmail);
    console.log('  Password actual:', user.uPassword ? '✓ Existe' : '❌ Vacío/Nulo');
    
    // Hashear la nueva contraseña
    console.log('\n🔐 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Actualizar el usuario
    console.log('📝 Actualizando usuario...');
    await userRepository.update(
      { uEmail: email },
      { uPassword: hashedPassword }
    );
    
    console.log('✓ Usuario actualizado exitosamente');
    console.log('\n📋 Credenciales para JMeter:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
