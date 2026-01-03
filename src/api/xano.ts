
import { instanceBaseUrl, realtimeConnectionHash } from "@/config";
import { XanoClient } from "@xano/js-sdk";

// These should be environment variables in a real app

export const xanoClient = new XanoClient({
  instanceBaseUrl: instanceBaseUrl,
  realtimeConnectionHash: realtimeConnectionHash,
});

export const getXanoChannel = (channelName: string) => {
  return xanoClient.channel(channelName);
};
