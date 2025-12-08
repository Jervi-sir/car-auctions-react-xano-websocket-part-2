
import { XanoClient } from "@xano/js-sdk";

// These should be environment variables in a real app
const instanceBaseUrl = "https://xqrx-tgqf-f4ju.n7e.xano.io/";
const realtimeConnectionHash = "_0M8gF8It3oVHJOU82qNioIXqgs";

export const xanoClient = new XanoClient({
  instanceBaseUrl,
  realtimeConnectionHash,
});

export const getXanoChannel = (channelName: string) => {
  return xanoClient.channel(channelName);
};
