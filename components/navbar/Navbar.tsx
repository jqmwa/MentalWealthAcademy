'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { getWalletAuthHeaders } from '@/lib/wallet-api';
import YourAccountsModal from '@/components/nav-buttons/YourAccountsModal';
import styles from './Navbar.module.css';

// Menu Icon Component - Chunky Y2K style
const MenuIcon: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.menuIcon}>
      <rect x="3" y="5" width="18" height="3" rx="1" fill="currentColor"/>
      <rect x="3" y="10.5" width="18" height="3" rx="1" fill="currentColor"/>
      <rect x="3" y="16" width="18" height="3" rx="1" fill="currentColor"/>
    </svg>
  );
};

// Home Icon - Using provided home SVG design
const HomeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M269.858 510.34c278.493-15.983 330.268-408.194 66.017-496.268-73.122-24.472-156.963-13.341-220.934 29.812h.018a254.731 254.731 0 0 0 -110.89 174.438l-.016-.011c-25.063 157.176 106.821 302.423 265.805 292.029zm206.117-161.425a237.421 237.421 0 0 1 -36.261 59.542c-1.055-6.293 1.857-13.582-2.482-19.455-4.708-9.179-9.069-18.543-13.975-27.613-1.824-3.373-1.321-5.311 1.367-7.739 28.792-25.263 3.125-11.831 5.953-47.938a4.9 4.9 0 0 0 -2.6-4.85c-13.648-8.714-31.465-11.707-45.569-2.023-17.578 8.308-42.651 1.953-48.337-18.223-5.029-13.411-4.412-26.954-4.544-40.65.811-7.386 10.943-8.626 9.3-17.163.39-10.84-3.143-22.283 7.108-29.358a6.737 6.737 0 0 1 5.833-1.545 40.084 40.084 0 0 0 26.732-6.234c8.377-5.311 18.72-1.873 28-3.082 4.423-.315 7.7.984 10.423 4.427 5.354 6.76 13.729 8.745 20.765 12.851 2.367 1.381 3.638-.36 4.748-1.792 5.911-7.626 14.97-10.188 22.913-14.573 4.326-2.479 13 6.985 20.384 7.321 14.715 51.506 11.3 108.843-9.758 158.097zm-3.459-193.579c-8.818 1.16-2.888-7.217-7.439-11.6a170.463 170.463 0 0 1 -13.022-12.946c-2.125-2.27-3.5-2.635-5.957-.21-6.6 6.53-6.229 5.837 1.467 13.64 8.986 9.878 15.759 9.713-.5 16.577-3.7 1.666-7.194 5.462-11.232-.023-2.444-3.319-5.771-5.549-5.376-10.662.607-7.884-5.408-13.6-8.191-20.407-.831-2.031-2.3-.6-3.083.4-5.855 7.528-14.7 10.438-22.712 14.62-13.839 12.1-10.68 10.782-29.044 10.256-1.7.073-2.2-1.977-2.938-3.175-9.247-15.138-7.454-18.828 2.126-33.119 3.524-2.114 19.094.326 22.037 3.4 1.323 1.38 2.409 2.988 4.318 5.394 1.467-5.86.724-10.35.876-14.773 2.482-18.149 17.732-9.97 28.558-13.912 5.117-3.911 7.217-5.858 6.132-7.777a237.687 237.687 0 0 1 43.98 64.317zm-45.461-65.836c-7.389-4.811-23.805-9.883-24.242-21.771a236.705 236.705 0 0 1 24.242 21.771zm-339.846-2.3a238.841 238.841 0 0 1 45.891-35.9c5.681 2.9 9.734 13.569 16.86 9.778 7.6-3.988 15.7-7.151 21.156-14.282 3.091-3.755 8.5-.881 12.537-2.02 15.872-2.149 20.163 15.923 26.1 26.674-.524.441-.8.864-1.028.838-13.772-1.554-26.4 2.868-38.881 7.674-4.1 1.579-7.26 1.713-9.825-2.235-3.17-4.882-7.243-5.023-12.3-2.917-4.684 3.311-21.513 3.883-20.35 10.528 1.142 6.243-3.787 16.884 7.419 14.757 5.251-1.827 9.765 13.69 12.974 4.769 6.886-27.9 35.916-3.553 58.3-21.38 8.235-4.886 15.008 11.208 18.208 16.877 2.432 5.319 4.191 11.581 12.742 9.726-5.362 5.364-10.761 10.692-16.063 16.114-1.538 1.573-2.936 1.069-4.663.469-6.666-2.314-13.423-4.371-20.066-6.75-3.169-1.135-4.689-1.246-4.617 3 5.424 29.2-19.451 1.038-36.726 22.936-21.556 21.664-4.874 39.844-34.5 62.619-1.771 1.626-3.242 1.822-4.993.536-12.87-9.136-41.786-14.1-51.4.834a3.1 3.1 0 0 0 .422 2.683c5.149 8.253 5.553 22.138 15.329 8.294 2.91-2.48 6.328-1.645 9.308-1.15 3.135.521 1.578 3.841 1.5 5.772.443 7.7 11.519 9.072 9.34 17.74-1.243 6.271 6.656 2.805 10.127 3.857 5.611.809 9.868-1.068 13.465-5.45 2.728-3.323 18.387-5.581 21.993-3.443 2.859 2.881 4.06 7.382 6.111 10.9 3.409 6.84 3.556 6.978 8.574 1.572 11.53-9.051 27.737-1.89 38.708 4.395 8.619 4.828 5.772 22.064 18.611 19.587 2.466-.582 3.8 1.519 5.152 3.042 9.326 11.409 24.384 10.044 29.9 25.689 3.554 6.525 3.174 12.244.154 18.7-2.146 12.126-8.109 21.061-20.7 24.457-9.984 3.586 6.86 19.876-15.993 26.372-5.861 1.276-6.62 5.765-5.861 11.029 2.424 13.558-.868 23.79-15.78 27.362-4.41 1.457-3.624 7.321-5.717 10.663-10.288 18.75-.936 32.429 12.166 45.56-11.5.679-23.963 1.849-27.938-10.532-4.966-14.423-9.46-28.971-16.824-42.455-2.473-4.528-.881-9.789-.945-14.7-1.795-20.093-22.313-35.132-18.459-56.541 1.494-10.723-13.8 4.59-29.635-14.925-5.278-6.261-17.559-21.393-15.438-29.236 4.335-10.806 4.792-23.841 14.8-31.341 4.263-3.314 4.651-13.648-3.3-11.644-20.424 3.417-16.06-11.93-28.022-9.016-8.1.862-13.947-1.793-20.242-7.46-18.886-17.37-24.3-4.5-35.121-17.378a238.052 238.052 0 0 1 67.54-135.048z" fill="currentColor"/>
    </svg>
  );
};

// Quests Icon - Using world/globe icon from provided SVG
const QuestsIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="m269.858 510.34c278.493-15.983 330.268-408.194 66.017-496.268-73.122-24.472-156.963-13.341-220.934 29.812h.018a254.731 254.731 0 0 0 -110.89 174.438l-.016-.011c-25.063 157.176 106.821 302.423 265.805 292.029zm206.117-161.425a237.421 237.421 0 0 1 -36.261 59.542c-1.055-6.293 1.857-13.582-2.482-19.455-4.708-9.179-9.069-18.543-13.975-27.613-1.824-3.373-1.321-5.311 1.367-7.739 28.792-25.263 3.125-11.831 5.953-47.938a4.9 4.9 0 0 0 -2.6-4.85c-13.648-8.714-31.465-11.707-45.569-2.023-17.578 8.308-42.651 1.953-48.337-18.223-5.029-13.411-4.412-26.954-4.544-40.65.811-7.386 10.943-8.626 9.3-17.163.39-10.84-3.143-22.283 7.108-29.358a6.737 6.737 0 0 1 5.833-1.545 40.084 40.084 0 0 0 26.732-6.234c8.377-5.311 18.72-1.873 28-3.082 4.423-.315 7.7.984 10.423 4.427 5.354 6.76 13.729 8.745 20.765 12.851 2.367 1.381 3.638-.36 4.748-1.792 5.911-7.626 14.97-10.188 22.913-14.573 4.326-2.479 13 6.985 20.384 7.321 14.715 51.506 11.3 108.843-9.758 158.097zm-3.459-193.579c-8.818 1.16-2.888-7.217-7.439-11.6a170.463 170.463 0 0 1 -13.022-12.946c-2.125-2.27-3.5-2.635-5.957-.21-6.6 6.53-6.229 5.837 1.467 13.64 8.986 9.878 15.759 9.713-.5 16.577-3.7 1.666-7.194 5.462-11.232-.023-2.444-3.319-5.771-5.549-5.376-10.662.607-7.884-5.408-13.6-8.191-20.407-.831-2.031-2.3-.6-3.083.4-5.855 7.528-14.7 10.438-22.712 14.62-13.839 12.1-10.68 10.782-29.044 10.256-1.7.073-2.2-1.977-2.938-3.175-9.247-15.138-7.454-18.828 2.126-33.119 3.524-2.114 19.094.326 22.037 3.4 1.323 1.38 2.409 2.988 4.318 5.394 1.467-5.86.724-10.35.876-14.773 2.482-18.149 17.732-9.97 28.558-13.912 5.117-3.911 7.217-5.858 6.132-7.777a237.687 237.687 0 0 1 43.98 64.317zm-45.461-65.836c-7.389-4.811-23.805-9.883-24.242-21.771a236.705 236.705 0 0 1 24.242 21.771zm-339.846-2.3a238.841 238.841 0 0 1 45.891-35.9c5.681 2.9 9.734 13.569 16.86 9.778 7.6-3.988 15.7-7.151 21.156-14.282 3.091-3.755 8.5-.881 12.537-2.02 15.872-2.149 20.163 15.923 26.1 26.674-.524.441-.8.864-1.028.838-13.772-1.554-26.4 2.868-38.881 7.674-4.1 1.579-7.26 1.713-9.825-2.235-3.17-4.882-7.243-5.023-12.3-2.917-4.684 3.311-21.513 3.883-20.35 10.528 1.142 6.243-3.787 16.884 7.419 14.757 5.251-1.827 9.765 13.69 12.974 4.769 6.886-27.9 35.916-3.553 58.3-21.38 8.235-4.886 15.008 11.208 18.208 16.877 2.432 5.319 4.191 11.581 12.742 9.726-5.362 5.364-10.761 10.692-16.063 16.114-1.538 1.573-2.936 1.069-4.663.469-6.666-2.314-13.423-4.371-20.066-6.75-3.169-1.135-4.689-1.246-4.617 3 5.424 29.2-19.451 1.038-36.726 22.936-21.556 21.664-4.874 39.844-34.5 62.619-1.771 1.626-3.242 1.822-4.993.536-12.87-9.136-41.786-14.1-51.4.834a3.1 3.1 0 0 0 .422 2.683c5.149 8.253 5.553 22.138 15.329 8.294 2.91-2.48 6.328-1.645 9.308-1.15 3.135.521 1.578 3.841 1.5 5.772.443 7.7 11.519 9.072 9.34 17.74-1.243 6.271 6.656 2.805 10.127 3.857 5.611.809 9.868-1.068 13.465-5.45 2.728-3.323 18.387-5.581 21.993-3.443 2.859 2.881 4.06 7.382 6.111 10.9 3.409 6.84 3.556 6.978 8.574 1.572 11.53-9.051 27.737-1.89 38.708 4.395 8.619 4.828 5.772 22.064 18.611 19.587 2.466-.582 3.8 1.519 5.152 3.042 9.326 11.409 24.384 10.044 29.9 25.689 3.554 6.525 3.174 12.244.154 18.7-2.146 12.126-8.109 21.061-20.7 24.457-9.984 3.586 6.86 19.876-15.993 26.372-5.861 1.276-6.62 5.765-5.861 11.029 2.424 13.558-.868 23.79-15.78 27.362-4.41 1.457-3.624 7.321-5.717 10.663-10.288 18.75-.936 32.429 12.166 45.56-11.5.679-23.963 1.849-27.938-10.532-4.966-14.423-9.46-28.971-16.824-42.455-2.473-4.528-.881-9.789-.945-14.7-1.795-20.093-22.313-35.132-18.459-56.541 1.494-10.723-13.8 4.59-29.635-14.925-5.278-6.261-17.559-21.393-15.438-29.236 4.335-10.806 4.792-23.841 14.8-31.341 4.263-3.314 4.651-13.648-3.3-11.644-20.424 3.417-16.06-11.93-28.022-9.016-8.1.862-13.947-1.793-20.242-7.46-18.886-17.37-24.3-4.5-35.121-17.378a238.052 238.052 0 0 1 67.54-135.048z" fill="currentColor"/>
    </svg>
  );
};

// Voting Icon - Using provided voting SVG design
const VotingIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="m163.508 372.218h77.492v-113h-89.637c.073 38.712 4.33 77.506 12.145 113z" fill="currentColor"/>
      <path d="m340.798 402.218h-69.798v109.782c19.936-8.42 39.669-33.147 55.821-70.691 5.216-12.122 9.886-25.238 13.977-39.091z" fill="currentColor"/>
      <path d="m185.179 441.31c16.152 37.543 35.886 62.271 55.821 70.69v-109.782h-69.797c4.091 13.853 8.761 26.969 13.976 39.092z" fill="currentColor"/>
      <path d="m271 372.218h77.492c7.816-35.493 12.073-74.288 12.145-113h-89.637z" fill="currentColor"/>
      <path d="m140.041 402.218h-96.407c33.778 50.064 84.798 87.524 144.538 103.899-11.179-14.098-21.463-31.826-30.551-52.951-6.728-15.641-12.612-32.78-17.58-50.948z" fill="currentColor"/>
      <path d="m354.379 453.165c-9.088 21.125-19.372 38.853-30.551 52.951 59.74-16.375 110.76-53.834 144.538-103.899h-96.406c-4.968 18.169-10.852 35.308-17.581 50.948z" fill="currentColor"/>
      <path d="m121.364 259.217h-121.364c0 40.565 9.45 78.917 26.245 113h106.622c-7.414-35.874-11.435-74.53-11.503-113z" fill="currentColor"/>
      <path d="m390.637 259.217c-.068 38.469-4.089 77.126-11.503 113h106.622c16.795-34.083 26.245-72.436 26.245-113z" fill="currentColor"/>
      <path d="m266.829 95.298c21.458-4.913 37.475-24.093 37.51-47.032-.041-26.663-21.666-48.266-48.339-48.266s-48.298 21.603-48.338 48.266c.036 22.939 16.052 42.118 37.51 47.031-5.357.619-10.549 1.773-15.536 3.383l26.364 56.967 26.365-56.966c-4.987-1.61-10.179-2.764-15.536-3.383z" fill="currentColor"/>
      <path d="m462.345 191.36v-4.68c0-31.073-22.899-56.791-52.74-61.216 15.617-4.054 27.152-18.233 27.177-35.112-.031-20.041-16.284-36.278-36.332-36.278s-36.302 16.237-36.332 36.278c.026 16.879 11.56 31.058 27.177 35.112-29.842 4.425-52.74 30.144-52.74 61.216v-10.814c0-25.323-11.617-47.914-29.798-62.785l-36.229 78.28h189.817z" fill="currentColor"/>
      <path d="m203.244 113.081c-18.181 14.872-29.798 37.462-29.798 62.785v10.814c0-31.073-22.899-56.791-52.74-61.216 15.617-4.054 27.152-18.234 27.177-35.114-.031-20.04-16.285-36.276-36.332-36.276-20.048 0-36.302 16.237-36.332 36.278.026 16.879 11.56 31.058 27.177 35.112-29.842 4.425-52.74 30.144-52.74 61.216v4.68h189.817z" fill="currentColor"/>
    </svg>
  );
};

// Library Icon - Using provided library/home SVG design
const LibraryIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="445.084" cy="66.057" rx="65.918" ry="66.057" fill="currentColor"/>
      <path d="m359.396 370.362h42.405v42.494h-42.405z" fill="currentColor"/>
      <path d="m282.207 139.243c8.225-7.312 18.81-11.338 29.804-11.338s21.579 4.027 29.804 11.338l11.819 10.506v-37.537c0-61.791-50.165-112.061-111.827-112.061-54.012 0-99.202 38.573-109.583 89.673 16.979 25.843 46.735 76.358 59.462 129.889z" fill="currentColor"/>
      <path d="m497.029 481.804h-20.677v-142.746l9.744 8.662c2.85 2.534 6.397 3.78 9.929 3.779 4.133 0 8.247-1.705 11.205-5.047 5.487-6.198 4.921-15.68-1.265-21.178l-43.887-39.013v-77.75c0-8.285-6.703-15.002-14.971-15.002s-14.971 6.717-14.971 15.002v51.133l-110.192-97.956c-5.669-5.039-14.201-5.039-19.869 0l-184.02 163.585c-6.185 5.498-6.751 14.98-1.265 21.178 5.487 6.199 14.95 6.765 21.134 1.267l9.744-8.662v142.746h-48.316v-65.45c6.395-1.959 12.549-5.175 18.376-9.584v-26.458c-8.949-2.107-17.131-6.938-23.335-13.946-16.433-18.564-14.732-47.066 3.792-63.535l67.572-60.068c-11.374-72.714-66.72-148.528-69.334-152.074-2.823-3.828-7.291-6.087-12.041-6.087s-9.218 2.259-12.041 6.087c-2.915 3.953-71.378 97.723-71.378 176.884 0 38.637 7.689 75.197 21.651 102.945 12.316 24.477 28.579 40.266 46.797 45.837v65.451h-54.44c-8.268 0-14.971 6.717-14.971 15.002s6.703 15.002 14.971 15.194h461.382 20.677c8.268-.192 14.971-6.909 14.971-15.194s-6.704-15.002-14.972-15.002zm-167.575-126.444c0-8.285 6.703-15.002 14.971-15.002h72.347c8.268 0 14.971 6.717 14.971 15.002v72.499c0 8.285-6.703 15.002-14.971 15.002h-72.347c-8.268 0-14.971-6.717-14.971-15.002zm-81.979 126.444v-111.442h-29.942v111.442h-29.941v-126.444c0-8.286 6.703-15.002 14.971-15.002h59.883c8.268 0 14.971 6.717 14.971 15.002v126.444z" fill="currentColor"/>
    </svg>
  );
};

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isYourAccountsModalOpen, setIsYourAccountsModalOpen] = useState(false);
  const [shardCount, setShardCount] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user data - works for both Privy and session-based auth
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Include wallet auth headers if wallet is connected
        let headers: HeadersInit = {};
        if (isConnected && address) {
          headers = await getWalletAuthHeaders(address, signMessageAsync);
        }
        
        const response = await fetch('/api/me', { 
          cache: 'no-store',
          headers
        });
        const data = await response.json();
        if (data?.user) {
          if (data.user.shardCount !== undefined) {
            setShardCount(data.user.shardCount);
          }
          setUsername(data.user.username || null);
          setAvatarUrl(data.user.avatarUrl || null);
        } else {
          // No user data - clear state
          setShardCount(null);
          setUsername(null);
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setShardCount(null);
        setUsername(null);
        setAvatarUrl(null);
      }
    };

    // Fetch immediately and also when wallet connection state changes
    fetchUserData();

    // Listen for shard updates and profile updates
    const handleShardsUpdate = () => {
      fetchUserData();
    };
    const handleProfileUpdate = () => {
      fetchUserData();
    };
    
    window.addEventListener('shardsUpdated', handleShardsUpdate);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('shardsUpdated', handleShardsUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [isConnected, address]); // Refetch when wallet connection state changes

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isProfileDropdownOpen]);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleYourAccountsClick = () => {
    setIsProfileDropdownOpen(false);
    setIsYourAccountsModalOpen(true);
  };

  const handleSignOut = async () => {
    setIsProfileDropdownOpen(false);
    
    // Disconnect wallet if connected
    if (isConnected) {
      disconnect();
    }
    
    // Clear session
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed to logout:', err);
    }
    
    // Clear local state
    setShardCount(null);
    setUsername(null);
    setAvatarUrl(null);
    
    // Redirect to landing page
    router.push('/');
  };


  return (
    <nav className={styles.navbar}>
      {/* Top Section */}
      <div className={styles.topSection}>
        <div className={styles.leftContent}>
          <Link href="/home" className={styles.brandLink} aria-label="Mental Wealth Academy">
            <div className={styles.logoWrapper}>
              <Image
                src="/icons/spacey2klogo.png"
                alt="Mental Wealth Academy"
                fill
                priority
                sizes="(max-width: 250px) 140px, 180px"
                className={styles.logo}
              />
            </div>
          </Link>
        </div>


        <div className={styles.rightContent}>
          {/* Desktop Navigation Links */}
          <div className={styles.linksContainer}>
            {/* Home Button */}
            <Link href="/home" className={`${styles.navButton} ${isActive('/home') ? styles.navButtonActive : ''}`}>
              <HomeIcon size={20} className={styles.homeIcon} />
              <span className={isActive('/home') ? styles.buttonLabelActive : styles.buttonLabel}>Home</span>
            </Link>

            {/* Quests Button */}
            <Link href="/quests" className={`${styles.navButton} ${isActive('/quests') ? styles.navButtonActive : ''}`}>
              <QuestsIcon size={20} className={styles.questIcon} />
              <span className={isActive('/quests') ? styles.buttonLabelActive : styles.buttonLabel}>Quests</span>
            </Link>

            {/* Voting Button */}
            <Link href="/voting" className={`${styles.navButton} ${isActive('/voting') ? styles.navButtonActive : ''}`}>
              <VotingIcon size={20} className={styles.questIcon} />
              <span className={isActive('/voting') ? styles.buttonLabelActive : styles.buttonLabel}>Voting</span>
            </Link>

            {/* Library Button */}
            <Link href="/library" className={`${styles.navButton} ${isActive('/library') ? styles.navButtonActive : ''}`}>
              <LibraryIcon size={20} className={styles.questIcon} />
              <span className={isActive('/library') ? styles.buttonLabelActive : styles.buttonLabel}>Library</span>
            </Link>
          </div>

          {/* Right Icons */}
          <div className={styles.rightIcons}>
            {/* Message Button */}
            <Link href="/forum" className={styles.messageButton} aria-label="Messages">
              <div className={styles.messageIcon}>
                <span className={styles.notificationDot}></span>
              </div>
            </Link>
            <div className={styles.shardsCounter}>
              <Image
                src="/icons/shard.svg"
                alt="Daemon"
                width={20}
                height={20}
                className={styles.shardIcon}
              />
              <span className={styles.shardsLabel}>Daemon:</span>
              <span className={styles.shardsValue}>
                {shardCount !== null ? String(shardCount).padStart(3, '0') : '000'}
              </span>
            </div>
            {/* User Info Dropdown */}
            {username && !username.startsWith('user_') && (
              <div className={styles.profileDropdownWrapper} ref={profileDropdownRef}>
                <div 
                  className={`${styles.profileDropdownDimmer} ${isProfileDropdownOpen ? styles.active : ''}`}
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                <button 
                  className={`${styles.userInfo} ${isProfileDropdownOpen ? styles.userInfoOpen : ''}`}
                  onClick={handleProfileClick}
                  type="button"
                >
                  {avatarUrl && (
                    <div className={styles.userAvatarContainer}>
                      <Image
                        src={avatarUrl}
                        alt={username}
                        width={32}
                        height={32}
                        className={styles.userAvatar}
                        unoptimized
                      />
                      <Image
                        src={avatarUrl}
                        alt={username}
                        width={32}
                        height={32}
                        className={styles.userAvatarClone}
                        unoptimized
                      />
                    </div>
                  )}
                  <span className={styles.username}>@{username}</span>
                </button>
                {isProfileDropdownOpen && (
                  <div className={styles.profileDropdown}>
                    <div className={styles.profileDropdownContent}>
                      <Link 
                        href="/home" 
                        className={styles.profileLink}
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <div className={styles.miniProfileCard}>
                          {avatarUrl && (
                            <div className={styles.miniProfilePicture}>
                              <Image
                                src={avatarUrl}
                                alt={username}
                                width={48}
                                height={48}
                                className={styles.miniProfileImage}
                                unoptimized
                              />
                            </div>
                          )}
                          <div className={styles.miniProfileInfo}>
                            <span className={styles.miniProfileName}>{username}</span>
                            <span className={styles.miniProfileLabel}>view profile</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className={styles.profileDropdownMenu}>
                      <button 
                        className={styles.dropdownItem}
                        onClick={handleYourAccountsClick}
                        type="button"
                      >
                        <div className={styles.dropdownItemInfo}>
                          <span className={styles.dropdownItemTitle}>accounts</span>
                          <span className={styles.dropdownItemLabel}>manage connections</span>
                        </div>
                      </button>
                      <div className={styles.dropdownDivider} />
                      <button 
                        className={styles.dropdownItem}
                        onClick={handleSignOut}
                        type="button"
                      >
                        <div className={styles.dropdownItemInfo}>
                          <span className={styles.dropdownItemTitle}>sign out</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Show incomplete profile message if username is temporary */}
            {username && username.startsWith('user_') && (
              <button
                className={styles.incompleteProfile}
                onClick={() => {
                  // Redirect to home page which will show avatar selection if needed
                  window.location.href = '/home';
                }}
                type="button"
              >
                <span>Complete Profile</span>
              </button>
            )}
            {/* Mobile Menu Toggle */}
            <button 
              className={styles.mobileMenuButton}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileLinksContainer}>
          <Link 
            href="/home" 
            className={`${styles.mobileNavButton} ${isActive('/home') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <HomeIcon size={20} className={styles.homeIcon} />
            <span>Home</span>
          </Link>
          <Link 
            href="/quests" 
            className={`${styles.mobileNavButton} ${isActive('/quests') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <QuestsIcon size={20} className={styles.questIcon} />
            <span>Quests</span>
          </Link>
          <Link 
            href="/voting" 
            className={`${styles.mobileNavButton} ${isActive('/voting') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <VotingIcon size={20} className={styles.questIcon} />
            <span>Voting</span>
          </Link>
          <Link 
            href="/library" 
            className={`${styles.mobileNavButton} ${isActive('/library') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LibraryIcon size={20} className={styles.questIcon} />
            <span>Library</span>
          </Link>
        </div>
      </div>
      {isYourAccountsModalOpen && (
        <YourAccountsModal onClose={() => setIsYourAccountsModalOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;

