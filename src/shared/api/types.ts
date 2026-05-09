/**
 * OpenAPI에서 생성된 타입에 대한 도메인 친화적 alias.
 * 컴포넌트/훅은 schema.gen.ts를 직접 import 하지 말고 여기서 가져온다.
 * (스펙이 바뀌어도 영향 범위를 한 곳에서 관찰)
 */
import type { components } from './schema.gen'

type S = components['schemas']

// ===== Enums =====
export type Region = S['Region']
export type CampusType = S['CampusType']
export type UserRole = S['UserRole']
export type PersonalRole = S['PersonalRole']
export type AuthProvider = S['AuthProvider']
export type FacilityType = S['FacilityType']
export type ClubCategory = S['ClubCategory']
export type ClubStatus = S['ClubStatus']
export type ClubMemberRole = S['ClubMemberRole']
export type ClubMemberStatus = S['ClubMemberStatus']
export type EventType = S['EventType']
export type EventCategory = S['EventCategory']
export type EventStatus = S['EventStatus']
export type ParticipantStatus = S['ParticipantStatus']
export type BoardType = S['BoardType']
export type PostCategory = S['PostCategory']
export type SenderType = S['SenderType']
export type MessageType = S['MessageType']
export type BotPersona = S['BotPersona']
export type NotificationType = S['NotificationType']

// ===== Domain Models =====
export type User = S['User']
export type School = S['School']
export type SchoolFacility = S['SchoolFacility']
export type Club = S['Club']
export type ClubMember = S['ClubMember']
export type Event = S['Event']
export type EventUpdateRequest = S['EventUpdateRequest']
export type EventParticipant = S['EventParticipant']
export type Post = S['Post']
export type Comment = S['Comment']
export type ChatRoom = S['ChatRoom']
export type ChatRoomMember = S['ChatRoomMember']
export type ChatMessage = S['ChatMessage']
export type Notification = S['Notification']
