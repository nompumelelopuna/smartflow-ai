import { createApp } from './app';
import { seedIfEmpty } from './seed';

seedIfEmpty();
const port = Number(process.env.PORT) || 3001;
createApp().listen(port, () => console.log(`SmartFlow on http://localhost:${port}`));
