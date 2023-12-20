// default ipmorts
import DrizzleService from './drizzle';

// named imports
import { Admin, Consumer, Kafka, Producer } from 'kafkajs';
import { config } from 'dotenv';
import { Topic } from '../common';
import { Logger } from '../logger';
import { messages } from '../db/schema';

config();

const { db } = DrizzleService;
const logger = new Logger();

const KAFKA_BROKER_URL = process.env.KAFKA_BROKER_URL || 'localhost:9092';

class KafkaService {
  private static instance: KafkaService | null = null;
  private _kafka: Kafka;
  private _producer: Producer | null = null;
  private _consumer: Consumer | null = null;
  private _admin: Admin | null = null;
  private isProducerConnected: boolean = false;
  private isConsumerConnected: boolean = false;
  private isAdminConnected: boolean = false;

  private constructor() {
    this._kafka = new Kafka({
      brokers: [KAFKA_BROKER_URL],
      clientId: 'admin',
    });

    this.createProducer();
    this.createConsumer();
    this.createAdmin();
    this.createTopics(Object.values(Topic));
  }

  static getInstance(): KafkaService {
    if (!KafkaService.instance) {
      KafkaService.instance = new KafkaService();
    }
    return KafkaService.instance;
  }

  private createProducer(): Producer {
    if (!this._producer) {
      this._producer = this._kafka.producer();
    }
    return this._producer;
  }

  private createConsumer(): Consumer {
    if (!this._consumer) {
      this._consumer = this._kafka.consumer({ groupId: 'test-group' });
    }
    return this._consumer;
  }

  private createAdmin(): Admin {
    if (!this._admin) {
      this._admin = this._kafka.admin();
    }
    return this._admin;
  }

  async createTopics(topics: string[]): Promise<void> {
    const admin = await this.getAdmin();
    await admin.createTopics({
      topics: topics.map((topic) => ({ topic })),
    });
  }

  get kafka(): Kafka {
    return this._kafka;
  }

  async getProducer(): Promise<Producer> {
    const producer = this.createProducer();
    if (!this.isProducerConnected) {
      await producer.connect();
      this.isProducerConnected = true;
    }
    return producer;
  }

  async getConsumer(): Promise<Consumer> {
    const consumer = this.createConsumer();
    if (!this.isConsumerConnected) {
      await consumer.connect();
      this.isConsumerConnected = true;
    }
    return consumer;
  }

  async getAdmin(): Promise<Admin> {
    const admin = this.createAdmin();
    if (!this.isAdminConnected) {
      await admin.connect();
      this.isAdminConnected = true;
    }
    return admin;
  }

  async produceMessage(topic: Topic, message: string): Promise<boolean> {
    const producer = await this.getProducer();
    await producer.send({
      topic,
      messages: [{ value: message }],
    });
    return true
  }

  async consumeMessages(topic: Topic): Promise<void> {
    const consumer = await this.getConsumer();
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({
      autoCommit: true,
      eachMessage: async ({ topic, message, pause }) => {
        if (!message.value) return;

        logger.info(`[DB] Inserting: ${message}`);
        
        try {
          await db.insert(messages).values({
            text: message.value.toString(),
          });
          logger.info(`[DB] Inserted!`);
        } catch (error) {
          logger.error(`[DB] Error: ${error}`);

          // Fault tolerance for DB Insertions
          pause();
          setTimeout(() => {
            logger.info(`[DB] Resuming...`);
            consumer.resume([{ topic }]);
          }, 60 * 1000);
        }
      },
    });
  }
}

export default KafkaService;
